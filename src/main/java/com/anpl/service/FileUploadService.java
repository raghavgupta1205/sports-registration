package com.anpl.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.util.Base64;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadService {

    @Value("${file.upload.directory:./uploads}")
    private String uploadDirectory;

    private static final long MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"};
    private static final Set<String> ALLOWED_IMAGE_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/gif",
            "image/webp"
    );

    public String uploadFile(MultipartFile file, String category) throws IOException {
        // Validate file
        validateFile(file);

        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDirectory, category);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        log.info("File uploaded successfully: {}", filePath);

        // Return relative path
        return category + "/" + newFilename;
    }

    public void deleteFile(String filePath) throws IOException {
        Path path = Paths.get(uploadDirectory, filePath);
        if (Files.exists(path)) {
            Files.delete(path);
            log.info("File deleted successfully: {}", filePath);
        } else {
            log.warn("File not found for deletion: {}", filePath);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 1MB");
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IllegalArgumentException("Invalid filename");
        }

        boolean validExtension = false;
        for (String ext : ALLOWED_EXTENSIONS) {
            if (filename.toLowerCase().endsWith(ext)) {
                validExtension = true;
                break;
            }
        }

        if (!validExtension) {
            throw new IllegalArgumentException("File type not allowed. Allowed types: jpg, jpeg, png, pdf");
        }
    }

    public String uploadBase64Image(String base64Data, String category) throws IOException {
        if (!StringUtils.hasText(base64Data)) {
            throw new IllegalArgumentException("Image data is required");
        }
        String data = base64Data.trim();
        String mimeType = "image/png";
        if (data.startsWith("data:")) {
            int commaIndex = data.indexOf(',');
            if (commaIndex == -1) {
                throw new IllegalArgumentException("Invalid image data");
            }
            String meta = data.substring(5, commaIndex);
            String[] parts = meta.split(";");
            mimeType = parts[0];
            data = data.substring(commaIndex + 1);
        }
        if (!ALLOWED_IMAGE_MIME_TYPES.contains(mimeType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported image type. Allowed: jpg, jpeg, png, gif, webp");
        }
        byte[] decoded = Base64.getDecoder().decode(data);
        if (decoded.length == 0) {
            throw new IllegalArgumentException("Image data is empty");
        }
        if (decoded.length > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Image size exceeds maximum limit of 1MB");
        }
        String extension = switch (mimeType.toLowerCase()) {
            case "image/jpeg", "image/jpg" -> ".jpg";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            default -> ".png";
        };

        Path uploadPath = Paths.get(uploadDirectory, category);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String newFilename = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(newFilename);
        Files.write(filePath, decoded, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        log.info("Base64 image uploaded successfully: {}", filePath);
        return category + "/" + newFilename;
    }
}

