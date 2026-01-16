package in.riteeshram.smartbudgeting.service;

import in.riteeshram.smartbudgeting.dto.IncomeDTO;
import in.riteeshram.smartbudgeting.entity.CategoryEntity;
import in.riteeshram.smartbudgeting.entity.IncomeEntity;
import in.riteeshram.smartbudgeting.entity.ProfileEntity;
import in.riteeshram.smartbudgeting.repository.CategoryRepository;
import in.riteeshram.smartbudgeting.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeService {
    private final CategoryRepository categoryRepository;
    private final IncomeRepository incomeRepository;
    private final ProfileService profileService;

    // Adds a new income to the database
    public IncomeDTO addIncome(IncomeDTO dto) {
        ProfileEntity profile = profileService.getCurrentProfile();
        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        IncomeEntity newIncome = toEntity(dto, profile, category);
        newIncome = incomeRepository.save(newIncome);
        return toDTO(newIncome);
    }

    // FIX: Retrieves ALL incomes so the Frontend can filter by specific months
    public List<IncomeDTO> getAllIncomesForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        // Uses the existing method in your repository to get all history
        List<IncomeEntity> list = incomeRepository.findByProfileIdOrderByDateDesc(profile.getId());
        return list.stream().map(this::toDTO).toList();
    }

    // Delete income by id for current user
    public void deleteIncome(Long incomeId) {
        ProfileEntity profile = profileService.getCurrentProfile();
        IncomeEntity entity = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new RuntimeException("Income not found"));
        if (!entity.getProfile().getId().equals(profile.getId())) {
            throw new RuntimeException("Unauthorized to delete this income");
        }
        incomeRepository.delete(entity);
    }

    // Get latest 5 incomes for current user
    public List<IncomeDTO> getLatest5IncomesForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<IncomeEntity> list = incomeRepository.findTop5ByProfileIdOrderByDateDesc(profile.getId());
        return list.stream().map(this::toDTO).toList();
    }

    // Get total incomes for current user
    public BigDecimal getTotalIncomeForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        BigDecimal total = incomeRepository.findTotalExpenseByProfileId(profile.getId());
        return total != null ? total: BigDecimal.ZERO;
    }

    // Filter incomes (Search functionality)
    public List<IncomeDTO> filterIncomes(LocalDate startDate, LocalDate endDate, String keyword, Long categoryId, Sort sort) {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<IncomeEntity> list = incomeRepository.filterIncomes(profile.getId(), startDate, endDate, keyword, categoryId, sort);
        return list.stream().map(this::toDTO).toList();
    }

    // Helper methods
    private IncomeEntity toEntity(IncomeDTO dto, ProfileEntity profile, CategoryEntity category) {
        return IncomeEntity.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .profile(profile)
                .category(category)
                .build();
    }

    private IncomeDTO toDTO(IncomeEntity entity) {
        return IncomeDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .icon(entity.getIcon())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId(): null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName(): "N/A")
                .amount(entity.getAmount())
                .date(entity.getDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}