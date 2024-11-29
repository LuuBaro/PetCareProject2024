package com.example.petcareproject.Repository;

import com.example.petcareproject.Model.ProductWeight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductWeightRepository extends JpaRepository<ProductWeight, Long> {
}
