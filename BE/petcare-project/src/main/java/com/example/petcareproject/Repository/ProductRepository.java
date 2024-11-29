package com.example.petcareproject.Repository;


import com.example.petcareproject.Model.Product;
import com.example.petcareproject.Model.ProductCategogy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p WHERE p.category = :category")
    List<Product> findAllByCategory(ProductCategogy category);

}
