package com.example.petcareproject.Controller;


import com.example.petcareproject.Model.Voucher;
import com.example.petcareproject.Services.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@CrossOrigin(origins = "http://localhost:5173")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    // Endpoint to create a new voucher
    @PostMapping
    public ResponseEntity<Voucher> createVoucher(@RequestBody Voucher voucher) {
        Voucher savedVoucher = voucherService.addVoucher(voucher);
        return new ResponseEntity<>(savedVoucher, HttpStatus.CREATED);
    }
    // Endpoint to get all vouchers
    @GetMapping
    public ResponseEntity<List<Voucher>> getAllVouchers() {
        List<Voucher> vouchers = voucherService.getAllVouchers();
        return ResponseEntity.ok(vouchers);
    }
    // Endpoint to update a voucher
    @PutMapping("/{voucherId}")
    public ResponseEntity<Voucher> updateVoucher(@PathVariable Long voucherId, @RequestBody Voucher voucherDetails) {
        System.out.println("Voucher ID: " + voucherId); // Debug
        Voucher updatedVoucher = voucherService.updateVoucher(voucherId, voucherDetails);
        return ResponseEntity.ok(updatedVoucher);
    }
    // Endpoint to delete a voucher
    @DeleteMapping("/{voucherId}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long voucherId) {
        System.out.println("Deleting Voucher ID: " + voucherId); // Debug
        voucherService.deleteVoucher(voucherId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{voucherId}/decrement")
    public ResponseEntity<String> decrementVoucherQuantity(@PathVariable Long voucherId) {
        try {
            voucherService.decrementVoucherQuantity(voucherId);
            return ResponseEntity.ok("Số lượng voucher đã được giảm");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}
