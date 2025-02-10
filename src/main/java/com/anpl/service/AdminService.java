package com.anpl.service;

import com.anpl.dto.EventRegistrationResponse;
import com.anpl.model.EventRegistration;
import com.anpl.model.User;
import com.anpl.model.RegistrationStatus;
import com.anpl.repository.EventRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final EventRegistrationRepository registrationRepository;
    private final EventRegistrationService registrationService;

    public List<EventRegistrationResponse> getAllRegistrations() {
        List<EventRegistration> registrations = registrationRepository.findAll();
        return registrations.stream()
                .map(registrationService::buildEventRegistrationResponse)
                .collect(Collectors.toList());
    }

    public void updateRegistrationStatus(Long registrationId, RegistrationStatus status) {
        registrationService.updateRegistrationStatus(registrationId, status);
    }

    public byte[] exportRegistrationsToExcel() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Registrations");
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Registration Number");
            headerRow.createCell(1).setCellValue("Full Name");
            headerRow.createCell(2).setCellValue("Email");
            headerRow.createCell(3).setCellValue("Phone");
            headerRow.createCell(4).setCellValue("Block");
            headerRow.createCell(5).setCellValue("T-Shirt Size");
            headerRow.createCell(6).setCellValue("Registration Status");
            headerRow.createCell(7).setCellValue("Payment Status");
            headerRow.createCell(8).setCellValue("Registration Date");
            
            // Fill data rows
            List<EventRegistration> registrations = registrationRepository.findAll();
            int rowNum = 1;
            for (EventRegistration registration : registrations) {
                Row row = sheet.createRow(rowNum++);
                User user = registration.getUser();
                row.createCell(0).setCellValue(user.getRegistrationNumber());
                row.createCell(1).setCellValue(user.getFullName());
                row.createCell(2).setCellValue(user.getEmail());
                row.createCell(3).setCellValue(user.getPhoneNumber());
                row.createCell(4).setCellValue(user.getBlock());
                row.createCell(5).setCellValue(user.getTshirtSize());
                row.createCell(6).setCellValue(registration.getRegistrationStatus().toString());
                row.createCell(7).setCellValue(registration.getPaymentStatus().toString());
                row.createCell(8).setCellValue(registration.getCreatedAt().toString());
            }
            
            // Auto-size columns
            for (int i = 0; i < 9; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }
} 