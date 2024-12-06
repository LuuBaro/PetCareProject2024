package com.example.petcareproject.Repository;


import com.example.petcareproject.Model.Order;
import com.example.petcareproject.Model.OrderDetail;
import com.example.petcareproject.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Bạn có thể thêm các phương thức tùy chỉnh nếu cần
    List<Order> findByUser_UserId(Long userId);

    @Query("SELECT od FROM OrderDetail od WHERE od.order.user.userId = :userId")
    List<OrderDetail> findByOrderUserId(@Param("userId") Long userId);

    List<Order> findAll();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    Double calculateRevenueBetweenDates(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    @Query(value = """
        SELECT 
            YEAR(order_date) AS year, 
            MONTH(order_date) AS month, 
            SUM(total_amount) AS totalRevenue
        FROM orders
        WHERE order_date >= DATEADD(MONTH, -12, GETDATE())
        GROUP BY YEAR(order_date), MONTH(order_date)
        ORDER BY YEAR(order_date) DESC, MONTH(order_date) DESC
        """, nativeQuery = true)
    List<Object[]> findLast12MonthsRevenue();
}
