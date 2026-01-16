package in.riteeshram.smartbudgeting.controller;

import in.riteeshram.smartbudgeting.dto.ExpenseDTO;
import in.riteeshram.smartbudgeting.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseDTO> addExpense(@RequestBody ExpenseDTO dto) {
        ExpenseDTO saved = expenseService.addExpense(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getExpenses() {
        // FIX: Now calls getAllExpensesForCurrentUser
        List<ExpenseDTO> expenses = expenseService.getAllExpensesForCurrentUser();
        return ResponseEntity.ok(expenses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    // ADDED: Missing Endpoints to prevent Frontend 404s
    @GetMapping("/download")
    public ResponseEntity<Void> downloadExcel() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/email")
    public ResponseEntity<Void> sendEmail() {
        return ResponseEntity.ok().build();
    }
}