# DriveClone Comprehensive Quality Assurance & Testing Strategy

This document defines the testing methodology, automated test suites, API contract validation, end-to-end user journey tests, and security/performance verification plans for **DriveClone**.

---

## 1. Testing Pyramid Architecture

```text
                  /\
                 /  \       E2E Tests (Cypress / Playwright)
                /    \      - Full User Lifecycle Workflows
               /------\
              /        \    Integration & Contract Tests (Testcontainers, Postman)
             /          \   - Controller, Repository, API Envelope Validation
            /------------\
           /              \ Unit Tests (JUnit 5, Mockito, React Testing Library)
          /                \ - Service Logic, Quota Engine, Storage Abstraction
         --------------------
```

---

## 2. Unit Testing Strategy

### 2.1 Backend Unit Tests (JUnit 5 & Mockito)
Backend unit tests validate business logic in isolation without spinning up a full Spring application context or connecting to a live MySQL database.

#### Priority Unit Test Coverage Target: `>= 80%` on core service packages:
- `com.drive.file.service.impl.FileServiceImpl`
- `com.drive.file.storage.impl.LocalStorageService`
- `com.drive.auth.service.impl.AuthServiceImpl`
- `com.drive.auth.service.impl.JwtServiceImpl`

#### Example JUnit 5 Test: Storage Quota Enforcement
```java
@ExtendWith(MockitoExtension.class)
class FileServiceImplTest {

    @Mock
    private FileRepository fileRepository;

    @Mock
    private StorageService storageService;

    @InjectMocks
    private FileServiceImpl fileService;

    @Test
    @DisplayName("Should throw QuotaExceededException when upload exceeds storage quota")
    void uploadFile_ExceedsQuota_ThrowsException() {
        Long userId = 101L;
        // User has already used 15 GB minus 100 bytes
        long currentUsedBytes = 16106127260L; 
        long incomingFileSize = 1024L; // 1 KB upload attempt

        when(fileRepository.calculateUsedBytesByUserId(userId)).thenReturn(currentUsedBytes);
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", new byte[1024]);

        assertThrows(QuotaExceededException.class, () -> {
            fileService.uploadFiles(new MultipartFile[]{file}, null, userId);
        });

        verify(storageService, never()).store(any(), any());
    }
}
```

### 2.2 Frontend Unit Tests (Jest & React Testing Library)
Frontend unit tests verify UI component rendering, state changes, and event handlers.
- `StorageMeter.test.jsx`: Verifies percentage progress bar calculation.
- `UploadModal.test.jsx`: Simulates file drag-and-drop actions.
- `FileCard.test.jsx`: Verifies action menu triggers (Rename, Delete, Favorite).

---

## 3. Integration & Contract Testing Strategy

### 3.1 Controller & Database Integration (`@SpringBootTest` & Testcontainers)
Integration tests verify the interaction between REST Controllers, JPA Repositories, and an in-memory or containerized MySQL database.

```java
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class FileControllerIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("file_db")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(username = "101")
    void getFileStatistics_ReturnsStandardJsonEnvelope() throws Exception {
        mockMvc.perform(get("/api/files/statistics")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.data.countsByType").exists());
    }
}
```

### 3.2 API Contract Validation Matrix
All API endpoints are validated against the standard JSON response envelope structure:

```json
{
  "success": boolean,
  "message": string,
  "data": object | array | null
}
```

---

## 4. End-to-End (E2E) Testing Strategy (Cypress / Playwright)

E2E test suites simulate actual user journeys in a live browser environment connected to the full microservice stack.

### 4.1 E2E User Journey Test Script
```javascript
describe('DriveClone Complete File Management Lifecycle Journey', () => {
  const userEmail = `testuser_${Date.now()}@example.com`;
  const userPassword = 'TestPassword123!';

  it('1. User Registration & Login Flow', () => {
    cy.visit('/register');
    cy.get('input[name="name"]').type('Automated Tester');
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPassword);
    cy.get('input[name="confirmPassword"]').type(userPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');

    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type(userPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/drive');
  });

  it('2. Create Folder, Upload File, Preview, and Soft Delete Flow', () => {
    // Create Folder
    cy.get('button').contains('New Folder').click();
    cy.get('input[name="folderName"]').type('Test Cypress Folder');
    cy.get('button').contains('Create').click();
    cy.contains('Test Cypress Folder').should('be.visible');

    // Upload File
    cy.get('button').contains('Upload File').click();
    cy.get('input[type="file"]').selectFile('cypress/fixtures/sample.pdf', { force: true });
    cy.get('button').contains('Start Upload').click();
    cy.contains('sample.pdf').should('be.visible');

    // Soft Delete
    cy.contains('sample.pdf').rightclick();
    cy.get('.context-menu-item').contains('Delete').click();
    cy.contains('sample.pdf').should('not.exist');

    // Restore from Recycle Bin
    cy.get('a').contains('Recycle Bin').click();
    cy.contains('sample.pdf').should('be.visible');
    cy.contains('sample.pdf').rightclick();
    cy.get('.context-menu-item').contains('Restore').click();

    // Verify restored in My Drive
    cy.get('a').contains('My Drive').click();
    cy.contains('sample.pdf').should('be.visible');
  });
});
```

---

## 5. Security & Vulnerability Testing

| Security Scenario | Test Objective | Expected Behavior |
| :--- | :--- | :--- |
| **Path Traversal Attack** | Attempt upload with filename `../../etc/passwd` or `../boot.ini`. | System renames file to UUID on disk and strips relative paths (`200 OK` / UUID generated). |
| **JWT Tampering** | Alter JWT signature payload in `Authorization` header. | Gateway & Microservices reject request with `401 Unauthorized`. |
| **Unauthorized File Access** | User A requests `GET /api/files/download/501` (owned by User B). | Service denies access with `403 Forbidden`. |
| **Quota Overfill Attack** | Attempt upload exceeding 15 GB user quota. | Service rejects request with `413 Payload Too Large`. |

---

## 6. Performance & Load Testing (JMeter / k6)

- **Target Metrics:**
  - Concurrent User Load: 50 active virtual users.
  - Read Operations Latency (`GET /api/files`): 95th percentile `< 150ms`.
  - Binary Stream Throughput (`GET /api/files/view/{id}`): Local disk streaming limited only by host I/O throughput (`> 50 MB/s`).
