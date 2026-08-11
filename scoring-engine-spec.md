# DriveClone Calculation Engines & Scoring Algorithms Specification

This document provides the formal mathematical and technical specifications for the computational engines operating within **DriveClone**: the **Storage Quota Calculation Engine**, **File Categorization Engine**, **Dashboard Statistics Aggregator**, **Recent Files Ranking Engine**, and **Search Relevance Engine**.

---

## 1. Storage Quota Calculation Engine

### 1.1 Objective
Track user disk utilization, evaluate incoming upload requests against user storage quotas, compute usage percentages, and enforce system boundaries.

### 1.2 Mathematical Formulations

#### Aggregate Storage Utilization
$$\text{usedBytes}(u) = \sum_{i \in \text{Files}(u, \text{is\_deleted}=\text{false})} \text{file\_size}_i$$

Only active, non-deleted files (`is_deleted = false`) owned by user $u$ contribute to storage utilization. Soft-deleted files in the Recycle Bin do NOT count against storage usage in the MVP design.

#### Storage Quota Percentage
$$\text{usagePercentage}(u) = \min\left(100.0, \frac{\text{usedBytes}(u)}{\text{quotaBytes}(u)} \times 100.0\right)$$

- Default $\text{quotaBytes}(u) = 16,106,127,360 \text{ bytes } (15 \text{ GB})$.

### 1.3 Pre-Upload Validation Logic Algorithm
```text
ALGORITHM ValidatePreUploadQuota(userId, incomingFileSizeBytes):
    1. currentUsedBytes <- SELECT COALESCE(SUM(file_size), 0) 
                           FROM files 
                           WHERE user_id = userId AND is_deleted = false;
    
    2. projectedUsedBytes <- currentUsedBytes + incomingFileSizeBytes;
    3. userQuotaBytes <- GetUserQuota(userId); // Default 16106127360
    
    4. IF projectedUsedBytes > userQuotaBytes THEN:
           THROW QuotaExceededException(
               "Storage quota exceeded. Used: " + currentUsedBytes + 
               " B, Requested: " + incomingFileSizeBytes + 
               " B, Quota: " + userQuotaBytes + " B"
           ); // Returns HTTP 413 Payload Too Large
    5. END IF
    6. RETURN TRUE;
END ALGORITHM
```

---

## 2. File Type Categorization Engine

### 2.1 Categorization Rules
The system evaluates the file's MIME Content-Type and extension to assign a normalized `file_type` enum value:

```text
EVALUATE ContentType / Extension:
    - IF ContentType STARTS WITH "image/" OR Ext IN [.jpg, .jpeg, .png, .gif, .webp, .svg] -> "IMAGE"
    - IF ContentType STARTS WITH "video/" OR Ext IN [.mp4, .avi, .mkv, .mov, .webm] -> "VIDEO"
    - IF ContentType == "application/pdf" OR Ext == .pdf -> "PDF"
    - IF ContentType STARTS WITH "audio/" OR Ext IN [.mp3, .wav, .flac, .aac, .ogg] -> "AUDIO"
    - IF ContentType IN ["application/msword", "application/vnd.openxmlformats-officedocument..."] OR Ext IN [.doc, .docx, .xls, .xlsx, .ppt, .pptx] -> "DOCUMENT"
    - IF ContentType STARTS WITH "text/" OR Ext IN [.txt, .md, .csv, .json, .xml, .java, .js, .html] -> "TEXT"
    - IF ContentType IN ["application/zip", "application/x-tar", "application/gzip"] OR Ext IN [.zip, .tar, .gz, .7z, .rar] -> "ARCHIVE"
    - ELSE -> "OTHER"
```

---

## 3. Dashboard Statistics Aggregation Engine

### 3.1 Aggregate Statistics Algorithm
Returns the total active file count and file count breakdown categorized by type for a user dashboard:

```sql
SELECT 
    file_type, 
    COUNT(*) AS total_count,
    COALESCE(SUM(file_size), 0) AS category_used_bytes
FROM files
WHERE user_id = ? 
  AND is_deleted = false
GROUP BY file_type;
```

---

## 4. Recent Files Scoring & Ranking Engine

### 4.1 Objective
Select and rank the top 10 most relevant recent files for the user's dashboard home view.

### 4.2 Recency Scoring Formula
Each active file $i$ is assigned a dynamic recency score $S(i)$ based on creation time ($T_{\text{created}}$), last update time ($T_{\text{updated}}$), and access frequency:

$$S(i) = w_1 \cdot \text{epoch}(T_{\text{updated}}) + w_2 \cdot \text{epoch}(T_{\text{created}}) + w_3 \cdot \min(\text{download\_count}_i, 10)$$

Where weights are tuned for recency preference:
- $w_1 = 0.70$ (Weight assigned to last modification/access time)
- $w_2 = 0.20$ (Weight assigned to file creation time)
- $w_3 = 0.10$ (Weight assigned to download engagement)

### 4.3 Database Query Implementation (MVP)
For the MVP SQL implementation, recency ranking simplifies to ordering by `updated_at DESC` limited to 10 rows:

```sql
SELECT * 
FROM files 
WHERE user_id = ? 
  AND is_deleted = false 
ORDER BY updated_at DESC 
LIMIT 10;
```

---

## 5. Search & Filtering Engine

### 5.1 Substring Search Algorithm (MVP)
Case-insensitive wildcard search matching filename tokens:

```sql
SELECT * 
FROM files 
WHERE user_id = ? 
  AND is_deleted = false 
  AND LOWER(original_name) LIKE LOWER(CONCAT('%', ?, '%'))
ORDER BY updated_at DESC;
```

### 5.2 Future Full-Text Search Scoring Engine (Elasticsearch BM25)
For Phase 6, search transitions to Elasticsearch using the BM25 (Best Matching 25) relevance scoring algorithm:

$$\text{Score}(D, Q) = \sum_{i=1}^{n} \text{IDF}(q_i) \cdot \frac{f(q_i, D) \cdot (k_1 + 1)}{f(q_i, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$

Where:
- $f(q_i, D)$ is the frequency of query term $q_i$ in document filename/metadata $D$.
- $|D|$ is the length of document metadata fields.
- $\text{avgdl}$ is average metadata field length across all stored files.
- $k_1 = 1.2$, $b = 0.75$.
