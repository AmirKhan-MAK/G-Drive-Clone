package com.clone.drive.exception;

public class OwnershipViolationException extends RuntimeException {
    public OwnershipViolationException(String message) {
        super(message);
    }
}
