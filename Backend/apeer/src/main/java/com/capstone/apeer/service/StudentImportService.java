package com.capstone.apeer.service;

import com.capstone.apeer.model.StudentGroup;
import com.capstone.apeer.model.User;
import com.capstone.apeer.repository.UserRepository;
import com.capstone.apeer.repository.StudentGroupRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class StudentImportService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentGroupRepository groupRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> importStudentsFromExcel(MultipartFile file) throws Exception {
        List<User> newStudents = new ArrayList<>();
        java.util.Map<String, List<User>> groupAssignments = new java.util.HashMap<>();

        try (InputStream is = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            int rowNumber = 0;
            java.util.Map<String, Integer> headerMap = new java.util.HashMap<>();

            while (rows.hasNext()) {
                Row currentRow = rows.next();

                // Check formatting in the first row header and create index map
                if (rowNumber == 0) {
                    List<String> requiredHeaders = List.of("ID Number", "First Name", "Last Name", "Email");
                    Iterator<Cell> headerCells = currentRow.iterator();
                    int idx = 0;

                    while (headerCells.hasNext()) {
                        String headerValue = getCellValue(headerCells.next()).trim().toLowerCase();
                        headerMap.put(headerValue, idx);
                        idx++;
                    }

                    boolean hasAllRequired = true;
                    for (String req : requiredHeaders) {
                        if (!headerMap.containsKey(req.toLowerCase())) {
                            hasAllRequired = false;
                            break;
                        }
                    }

                    if (!hasAllRequired) {
                        throw new IllegalArgumentException(
                                "Invalid Excel format. Required headers missing: ID Number, First Name, Last Name, Email");
                    }
                    rowNumber++;
                    continue;
                }

                User user = new User();
                user.setRole("student");
                // Default password for imported students
                user.setPassword(passwordEncoder.encode("student123"));

                boolean hasData = false;
                String groupName = null;

                // Dynamically fetch values based on the header map
                for (java.util.Map.Entry<String, Integer> entry : headerMap.entrySet()) {
                    String headerName = entry.getKey();
                    int colIdx = entry.getValue();
                    Cell currentCell = currentRow.getCell(colIdx, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                    String cellValue = getCellValue(currentCell);

                    if (cellValue != null && !cellValue.trim().isEmpty()) {
                        hasData = true;

                        if (headerName.equalsIgnoreCase("id number")) {
                            user.setIdNumber(cellValue);
                        } else if (headerName.equalsIgnoreCase("first name")) {
                            user.setFirstName(cellValue);
                        } else if (headerName.equalsIgnoreCase("last name")) {
                            user.setLastName(cellValue);
                        } else if (headerName.equalsIgnoreCase("email")) {
                            user.setEmail(cellValue);
                        } else if (headerName.equalsIgnoreCase("phone number")) {
                            user.setPhoneNumber(cellValue);
                        } else if (headerName.equalsIgnoreCase("group number")) {
                            groupName = cellValue;
                        }
                    }
                }

                // If row has data and email doesn't already exist
                if (hasData && user.getEmail() != null && userRepository.findByEmail(user.getEmail()).isEmpty()) {
                    newStudents.add(user);

                    if (groupName != null && !groupName.trim().isEmpty()) {
                        groupAssignments.computeIfAbsent(groupName.trim(), k -> new ArrayList<>()).add(user);
                    }
                }
            }
        }

        if (!newStudents.isEmpty()) {
            userRepository.saveAll(newStudents);

            // Re-fetch to ensure they have IDs assigned (useful depending on JPA cascading,
            // though saveAll updates handles)
            // Associate parsed students with their groups
            for (java.util.Map.Entry<String, List<User>> entry : groupAssignments.entrySet()) {
                String gName = entry.getKey();
                StudentGroup group = groupRepository.findByName(gName).orElseGet(() -> {
                    StudentGroup newGroup = new StudentGroup();
                    newGroup.setName(gName);
                    newGroup.setMembers(new ArrayList<>());
                    return newGroup;
                });

                if (group.getMembers() == null) {
                    group.setMembers(new ArrayList<>());
                }

                for (User u : entry.getValue()) {
                    if (!group.getMembers().contains(u)) {
                        group.getMembers().add(u);
                    }
                }

                groupRepository.save(group);
            }
        }

        return newStudents;
    }

    private String getCellValue(Cell cell) {
        if (cell == null)
            return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }
}
