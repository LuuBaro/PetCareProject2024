package com.example.petcareproject.Repository;

import com.example.petcareproject.Model.ProductVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ProductVoucherRepository extends JpaRepository<ProductVoucher, Long> {
}
