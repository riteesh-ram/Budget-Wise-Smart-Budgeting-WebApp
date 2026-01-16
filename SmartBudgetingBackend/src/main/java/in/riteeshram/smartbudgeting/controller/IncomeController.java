package in.riteeshram.smartbudgeting.controller;

import in.riteeshram.smartbudgeting.dto.IncomeDTO;
import in.riteeshram.smartbudgeting.service.IncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/incomes")
public class IncomeController {

    private final IncomeService incomeService;

    @PostMapping
    public ResponseEntity<IncomeDTO> addIncome(@RequestBody IncomeDTO dto) {
        IncomeDTO saved = incomeService.addIncome(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<IncomeDTO>> getIncomes() {
        // FIX: Calls the new method that fetches ALL history
        List<IncomeDTO> incomes = incomeService.getAllIncomesForCurrentUser();
        return ResponseEntity.ok(incomes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id) {
        incomeService.deleteIncome(id);
        return ResponseEntity.noContent().build();
    }

    // --- Missing Endpoints expected by Frontend ---

    @GetMapping("/download")
    public ResponseEntity<Void> downloadExcel() {
        // TODO: Implement the actual Excel generation logic in IncomeService
        // For now, this returns 200 OK so the frontend doesn't crash.
        return ResponseEntity.ok().build();
    }

    @GetMapping("/email")
    public ResponseEntity<Void> sendEmail() {
        // TODO: Implement the actual Email logic in IncomeService
        // For now, this returns 200 OK so the frontend doesn't crash.
        return ResponseEntity.ok().build();
    }
}