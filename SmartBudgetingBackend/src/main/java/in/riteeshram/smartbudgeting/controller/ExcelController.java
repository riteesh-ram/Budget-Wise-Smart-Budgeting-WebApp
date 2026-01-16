package in.riteeshram.smartbudgeting.controller;

import in.riteeshram.smartbudgeting.service.ExcelService;
import in.riteeshram.smartbudgeting.service.ExpenseService;
import in.riteeshram.smartbudgeting.service.IncomeService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/excel")
@RequiredArgsConstructor
public class ExcelController {

    private final ExcelService excelService;
    private final IncomeService incomeService;
    private final ExpenseService expenseService;

    @GetMapping("/download/income")
    public void downloadIncomeExcel(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=income.xlsx");
        // FIX: Calls the new method name 'getAllIncomesForCurrentUser'
        excelService.writeIncomesToExcel(response.getOutputStream(), incomeService.getAllIncomesForCurrentUser());
    }

    @GetMapping("/download/expense")
    public void downloadExpenseExcel(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=expense.xlsx");
        // FIX: Called getAllExpensesForCurrentUser
        excelService.writeExpensesToExcel(response.getOutputStream(), expenseService.getAllExpensesForCurrentUser());
    }
}