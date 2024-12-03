package com.example.petcareproject.Repository;

import com.example.petcareproject.Model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
}
