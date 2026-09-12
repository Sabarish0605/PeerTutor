package com.peertutor.api.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class FileUploadControllerTest {

    private final FileUploadController fileUploadController = new FileUploadController();

    @Test
    @DisplayName("File Upload: Successfully uploads image file and returns accessible URL")
    void testUploadImageFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar_test.png",
                "image/png",
                "dummy image content bytes".getBytes()
        );

        ResponseEntity<Map<String, String>> response = fileUploadController.uploadFile(file);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        String url = response.getBody().get("url");
        assertNotNull(url);
        assertTrue(url.startsWith("http://localhost:8080/uploads/"));
        assertTrue(url.endsWith(".png"));
    }

    @Test
    @DisplayName("File Upload: Empty file returns 400 Bad Request")
    void testUploadEmptyFileFails() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        ResponseEntity<Map<String, String>> response = fileUploadController.uploadFile(emptyFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().containsKey("error"));
    }
}
