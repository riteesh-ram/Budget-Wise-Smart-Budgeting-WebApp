package in.riteeshram.smartbudgeting.repository;

import in.riteeshram.smartbudgeting.entity.IncomeEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface IncomeRepository extends JpaRepository<IncomeEntity, Long> {

    //select * from tbl_incomes where profile_id = ?1 order by date desc
    List<IncomeEntity> findByProfileIdOrderByDateDesc(Long profileId);

    //select * from tbl_incomes where profile_id = ?1 order by date desc limit 5
    List<IncomeEntity> findTop5ByProfileIdOrderByDateDesc(Long profileId);

    @Query("SELECT SUM(i.amount) FROM IncomeEntity i WHERE i.profile.id = :profileId")
    BigDecimal findTotalExpenseByProfileId(@Param("profileId") Long profileId);

    //select * from tbl_incomes where profile_id = ?1 and date between ?2 and ?3 and name like %?4%
   // REPLACING the old findByProfileIdAndDateBetweenAndNameContainingIgnoreCase
    @Query("SELECT i FROM IncomeEntity i WHERE i.profile.id = :profileId " +
           "AND i.date BETWEEN :startDate AND :endDate " +
           "AND LOWER(i.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "AND (:categoryId IS NULL OR i.category.id = :categoryId)")
    List<IncomeEntity> filterIncomes(
            @Param("profileId") Long profileId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            Sort sort
    );

    //select * from tbl_incomes where profile_id = ?1 and date between ?2 and ?3
    List<IncomeEntity> findByProfileIdAndDateBetween(Long profileId, LocalDate startDate, LocalDate endDate);

    // NEW: Delete all incomes that belong to a list of Category IDs
    void deleteAllByCategoryIdIn(List<Long> categoryIds);
}
