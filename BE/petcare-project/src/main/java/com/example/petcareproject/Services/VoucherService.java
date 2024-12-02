package com.example.petcareproject.Services;


import com.example.petcareproject.Model.Voucher;
import com.example.petcareproject.Repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    // Thêm mới voucher
    public Voucher addVoucher(Voucher voucher) {
        return voucherRepository.save(voucher);
    }
    // Lấy danh sách tất cả voucher
    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    // Sửa voucher
    public Voucher updateVoucher(Long voucherId, Voucher voucherDetails) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found with id " + voucherId));

        // Cập nhật thông tin voucher
        voucher.setName(voucherDetails.getName());
        voucher.setStartDate(voucherDetails.getStartDate());
        voucher.setEndDate(voucherDetails.getEndDate());
        voucher.setQuantity(voucherDetails.getQuantity());
        voucher.setPercents(voucherDetails.getPercents());
        voucher.setCondition(voucherDetails.getCondition());

        return voucherRepository.save(voucher);
    }

    // Xóa voucher
    public void deleteVoucher(Long voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found with id " + voucherId));

        voucherRepository.delete(voucher);
    }

}
