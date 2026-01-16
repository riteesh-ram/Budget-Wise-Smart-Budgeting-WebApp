package in.riteeshram.smartbudgeting.repository;

import in.riteeshram.smartbudgeting.entity.ExpenseEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<ExpenseEntity, Long> {

    //select * from tbl_expenses where profile_id = ?1 order by date desc
    List<ExpenseEntity> findByProfileIdOrderByDateDesc(Long profileId);

    //select * from tbl_expenses where profile_id = ?1 order by date desc limit 5
    List<ExpenseEntity> findTop5ByProfileIdOrderByDateDesc(Long profileId);

    @Query("SELECT SUM(e.amount) FROM ExpenseEntity e WHERE e.profile.id = :profileId")
    BigDecimal findTotalExpenseByProfileId(@Param("profileId") Long profileId);

    // REPLACING the old findByProfileIdAndDateBetweenAndNameContainingIgnoreCase
    @Query("SELECT e FROM ExpenseEntity e WHERE e.profile.id = :profileId " +
           "AND e.date BETWEEN :startDate AND :endDate " +
           "AND LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "AND (:categoryId IS NULL OR e.category.id = :categoryId)")
    List<ExpenseEntity> filterExpenses(
            @Param("profileId") Long profileId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            Sort sort
    );
   

    //select * from tbl_expenses where profile_id = ?1 and date between ?2 and ?3
    List<ExpenseEntity> findByProfileIdAndDateBetween(Long profileId, LocalDate startDate, LocalDate endDate);

    //select * from tbl_expenses where profile_id = ?1 and date = ?2
    List<ExpenseEntity> findByProfileIdAndDate(Long profileId, LocalDate date);

    // NEW: Delete all expenses that belong to a list of Category IDs
    void deleteAllByCategoryIdIn(List<Long> categoryIds);
}
