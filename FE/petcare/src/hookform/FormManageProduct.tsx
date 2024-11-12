import React, { useState } from "react";

function FormManageProduct({
                               error,
                               uploading,
                               uploadProgress,
                               productDetails,
                               setProductDetails,
                               formErrors,
                               file,
                               setFile,
                               brands,
                               categories,
                               handleCreateOrUpdate,
                           }) {
    return (
        <div>
            <h1 className="text-3xl font-bold text-center mb-6">Quản lý sản phẩm</h1>

            {error && <div className="text-red-600 mb-4 text-center">{error}</div>}

            {uploading && (
                <div className="text-blue-600 mb-4 text-center">
                    Đang tải ảnh lên...
                    <div className="w-full mt-2">
                        <div className="bg-gray-300 rounded-full w-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <div className="text-center text-sm mt-1">{Math.round(uploadProgress)}%</div>
                    </div>
                </div>
            )}

            {/* Product Form */}
            <div className="mb-6 grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-semibold">Tên sản phẩm</label>
                    <input
                        type="text"
                        value={productDetails.productName}
                        onChange={(e) => setProductDetails({ ...productDetails, productName: e.target.value })}
                        className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                    />
                    {formErrors.productName && (
                        <span className="text-red-600 text-sm">{formErrors.productName}</span>
                    )}
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-semibold">Số lượng</label>
                    <input
                        type="number"
                        value={productDetails.productQuantity}
                        onChange={(e) =>
                            setProductDetails({ ...productDetails, productQuantity: e.target.value })
                        }
                        className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                    />
                    {formErrors.productQuantity && (
                        <span className="text-red-600 text-sm">{formErrors.productQuantity}</span>
                    )}
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-semibold">Mô tả</label>
                    <textarea
                        value={productDetails.description}
                        onChange={(e) => setProductDetails({ ...productDetails, description: e.target.value })}
                        className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-semibold">Chọn hình ảnh</label>
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label htmlFor="brand" className="block font-medium text-gray-700 mb-2">
                        Thương hiệu
                    </label>
                    <select
                        id="brand"
                        value={productDetails.brand.brandId || ""}
                        onChange={(e) =>
                            setProductDetails({ ...productDetails, brand: { brandId: e.target.value } })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Chọn thương hiệu</option>
                        {brands.map((brand) => (
                            <option key={brand.brandId} value={brand.brandId}>
                                {brand.brandName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="category" className="block font-medium text-gray-700 mb-2">
                        Danh mục
                    </label>
                    <select
                        id="category"
                        value={productDetails.category.productCategogyId || ""}
                        onChange={(e) =>
                            setProductDetails({
                                ...productDetails,
                                category: { productCategogyId: e.target.value },
                            })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Chọn danh mục</option>
                        {categories.map((category) => (
                            <option key={category.productCategogyId} value={category.productCategogyId}>
                                {category.categogyName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-span-2">
                    <button
                        type="button"
                        onClick={handleCreateOrUpdate}
                        className="bg-blue-600 text-white p-2 rounded-md w-full mt-4"
                    >
                        Lưu sản phẩm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FormManageProduct;
