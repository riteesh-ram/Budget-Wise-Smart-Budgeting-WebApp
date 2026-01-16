package in.riteeshram.smartbudgeting.service;

import in.riteeshram.smartbudgeting.dto.CategoryDTO;
import in.riteeshram.smartbudgeting.entity.CategoryEntity;
import in.riteeshram.smartbudgeting.entity.ProfileEntity;
import in.riteeshram.smartbudgeting.repository.CategoryRepository;
import in.riteeshram.smartbudgeting.repository.ExpenseRepository; // Import
import in.riteeshram.smartbudgeting.repository.IncomeRepository;   // Import
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final ProfileService profileService;
    private final CategoryRepository categoryRepository;
    
    // Inject these to handle the cascade delete
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    // save category
    public CategoryDTO saveCategory(CategoryDTO categoryDTO) {
        ProfileEntity profile = profileService.getCurrentProfile();
        if (categoryRepository.existsByNameAndProfileId(categoryDTO.getName(), profile.getId())) {
            throw new RuntimeException("Category with this name already exists");
        }

        CategoryEntity newCategory = toEntity(categoryDTO, profile);
        newCategory = categoryRepository.save(newCategory);
        return toDTO(newCategory);
    }

    // get categories for current user
    public List<CategoryDTO> getCategoriesForCurrentUser() {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<CategoryEntity> categories = categoryRepository.findByProfileId(profile.getId());
        return categories.stream().map(this::toDTO).toList();
    }

    // get categories by type for current user
    public List<CategoryDTO> getCategoriesByTypeForCurrentUser(String type) {
        ProfileEntity profile = profileService.getCurrentProfile();
        List<CategoryEntity> entities = categoryRepository.findByTypeAndProfileId(type, profile.getId());
        return entities.stream().map(this::toDTO).toList();
    }

    public CategoryDTO updateCategory(Long categoryId, CategoryDTO dto) {
        ProfileEntity profile = profileService.getCurrentProfile();
        CategoryEntity existingCategory = categoryRepository.findByIdAndProfileId(categoryId, profile.getId())
                .orElseThrow(() -> new RuntimeException("Category not found or not accessible"));
        existingCategory.setName(dto.getName());
        existingCategory.setIcon(dto.getIcon());
        existingCategory = categoryRepository.save(existingCategory);
        return toDTO(existingCategory);
    }

    @Transactional // Critical: Ensures everything happens together or fails together
    public void deleteCategories(List<Long> categoryIds) {
        ProfileEntity profile = profileService.getCurrentProfile();
        
        // 1. Verify these categories actually belong to the user
        List<CategoryEntity> categoriesToDelete = categoryRepository.findAllByIdInAndProfileId(categoryIds, profile.getId());

        if (categoriesToDelete.isEmpty()) {
            throw new RuntimeException("No valid categories found to delete");
        }

        // Get the list of validated IDs
        List<Long> validatedIds = categoriesToDelete.stream().map(CategoryEntity::getId).toList();

        // 2. DELETE ASSOCIATED DATA (Cascade Delete)
        // This prevents the foreign key constraint error
        expenseRepository.deleteAllByCategoryIdIn(validatedIds);
        incomeRepository.deleteAllByCategoryIdIn(validatedIds);

        // 3. Delete the categories
        categoryRepository.deleteAll(categoriesToDelete);
    }

    // helper methods
    private CategoryEntity toEntity(CategoryDTO categoryDTO, ProfileEntity profile) {
        return CategoryEntity.builder()
                .name(categoryDTO.getName())
                .icon(categoryDTO.getIcon())
                .profile(profile)
                .type(categoryDTO.getType())
                .build();
    }

    private CategoryDTO toDTO(CategoryEntity entity) {
        return CategoryDTO.builder()
                .id(entity.getId())
                .profileId(entity.getProfile() != null ?  entity.getProfile().getId(): null)
                .name(entity.getName())
                .icon(entity.getIcon())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .type(entity.getType())
                .build();
    }
}