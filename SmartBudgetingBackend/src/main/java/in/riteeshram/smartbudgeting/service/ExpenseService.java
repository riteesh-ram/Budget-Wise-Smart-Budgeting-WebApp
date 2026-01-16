package in.riteeshram.smartbudgeting.service;

import in.riteeshram.smartbudgeting.dto.ExpenseDTO;
import in.riteeshram.smartbudgeting.entity.CategoryEntity;
import in.riteeshram.smartbudgeting.entity.ExpenseEntity;
import in.riteeshram.smartbudgeting.entity.ProfileEntity;
import in.riteeshram.smartbudgeting.repository.CategoryRepository;
import in.riteeshram.smartbudgeting.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final ProfileService profileService;

    // Adds a new expense to the database
    public ExpenseDTO addExpense(ExpenseDTO dto) {
        ProfileEntity profile = profileService.getCurrentProfile();
        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        ExpenseEntity newExpense = toEntity(dto, profile, category);
        newExpense = expenseRepository.save(newExpense);
        return toDTO(newExpense);
    }

    // FIX: Renamed to getAll and removed date filtering to support history graph
    public List<ExpenseDTO> getAllExpensesForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        // Uses existing repository method to fetch everything
        List<ExpenseEntity> list = expenseRepository.findByProfileIdOrderByDateDesc(profile.getId());
        return list.stream().map(this::toDTO).toList();
    }

    // Delete expense by id for current user
    public void deleteExpense(Long expenseId) {
        ProfileEntity profile = profileService.getCurrentProfile();
        ExpenseEntity entity = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        if (!entity.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized to delete this expense");
        }
        expenseRepository.delete(entity);
    }

    // Get latest 5 expenses for current user
    public List<ExpenseDTO> getLatest5ExpensesForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<ExpenseEntity> list = expenseRepository.findTop5ByProfileIdOrderByDateDesc(profile.getId());
        return list.stream().map(this::toDTO).toList();
    }

    // Get total expenses for current user
    public BigDecimal getTotalExpenseForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        BigDecimal total = expenseRepository.findTotalExpenseByProfileId(profile.getId());
        return total != null ? total : BigDecimal.ZERO;
    }

    // Filter expenses
    public List<ExpenseDTO> filterExpenses(LocalDate startDate, LocalDate endDate, String keyword, Long categoryId, Sort sort) {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<ExpenseEntity> list = expenseRepository.filterExpenses(profile.getId(), startDate, endDate, keyword, categoryId, sort);
        return list.stream().map(this::toDTO).toList();
    }

    // Notifications
    public List<ExpenseDTO> getExpensesForUserOnDate(Long profileId, LocalDate date) {
        List<ExpenseEntity> list = expenseRepository.findByProfileIdAndDate(profileId, date);
        return list.stream().map(this::toDTO).toList();
    }

    // Helper methods
    private ExpenseEntity toEntity(ExpenseDTO dto, ProfileEntity profile, CategoryEntity category) {
        return ExpenseEntity.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .profile(profile)
                .category(category)
                .build();
    }

    private ExpenseDTO toDTO(ExpenseEntity entity) {
        return ExpenseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .icon(entity.getIcon())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : "N/A")
                .amount(entity.getAmount())
                .date(entity.getDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}