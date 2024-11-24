package com.example.petcareproject.dto;

import com.example.petcareproject.Model.Product;
import com.example.petcareproject.Model.ProductColor;
import com.example.petcareproject.Model.ProductSize;
import com.example.petcareproject.Model.ProductWeight;
import lombok.Data;

@Data
public class OrderDetailDTO {
    private Long productDetailId;
    private Long productId; // Mã sản phẩm
    private String productName; // Tên sản phẩm
    private String productImage; // Hình ảnh sản phẩm
    private double productPrice; // Giá sản phẩm
    private String productCategory; // Loại sản phẩm
    private String productBrand; // Thương hiệu sản phẩm
    private int quantity; // Số lượng
    private String productColor; // Tên màu sản phẩm
    private String productSize; // Tên kích cỡ sản phẩm
    private String productWeightvalue; // Tên cân nặng sản phẩm
    private double price; // Giá chi tiết sản phẩm
    private Long orderId; // Mã đơn hàng
}

