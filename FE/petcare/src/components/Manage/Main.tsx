import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2"; // Đổi từ Line thành Bar
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement, // Thêm BarElement
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { OrderService } from "../../service/OrderService.js";

// Đăng ký các component Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MyMain() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [revenueData, setRevenueData] = useState({ dates: [], revenues: [] });
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchDefaultRevenueData = async () => {
        setIsLoading(true);
        try {
            const data = await OrderService.getLast12MonthsRevenue();
            console.log("Data fetched from API:", data); // Log dữ liệu API trả về

            if (data && Array.isArray(data)) {
                // Sắp xếp theo thứ tự tháng gần nhất ở cuối (giảm dần thời gian)
                const sortedData = [...data].sort((a, b) => {
                    const dateA = new Date(a.year, a.month - 1); // month trong JavaScript là 0-based
                    const dateB = new Date(b.year, b.month - 1);
                    return dateA - dateB;
                });

                const dates = sortedData.map(item => `${item.year}-${String(item.month).padStart(2, '0')}`);
                const revenues = sortedData.map(item => parseFloat(item.totalRevenue));

                setRevenueData({ dates, revenues });

                const total = revenues.reduce((sum, revenue) => sum + revenue, 0);
                setTotalRevenue(total);
            } else {
                console.error("Invalid data structure for default revenue:", data);
                setRevenueData({ dates: [], revenues: [] });
                setTotalRevenue(0);
            }
        } catch (error) {
            console.error("Error fetching default revenue data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRevenueData = async () => {
        if (!startDate || !endDate) return;

        setIsLoading(true);
        try {
            const data = await OrderService.getRevenueBetweenDates(startDate, endDate);

            if (data) {
                setRevenueData({
                    dates: [`${startDate} - ${endDate}`],
                    revenues: [data], // Dữ liệu doanh thu là tổng
                });
                setTotalRevenue(data); // Tổng doanh thu từ Backend
            } else {
                console.error("Invalid data structure:", data);
                setRevenueData({ dates: [], revenues: [] });
                setTotalRevenue(0);
            }
        } catch (error) {
            console.error("Error fetching revenue data:", error);
            setRevenueData({ dates: [], revenues: [] });
            setTotalRevenue(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDefaultRevenueData();
    }, []);

    const chartData = {
        labels: revenueData.dates || [],
        datasets: [
            {
                label: "Doanh thu (VND)",
                data: revenueData.revenues || [],
                backgroundColor: "rgba(54, 162, 235, 0.8)", // Màu cột
                borderColor: "rgba(54, 162, 235, 1)", // Viền cột
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Thống kê Doanh thu (Biểu đồ cột)" },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) =>
                        value.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
                },
            },
        },
    };

    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <div className="container mx-auto">
                <h2 className="text-2xl font-bold mb-4">Thống kê Doanh thu</h2>

                <div className="bg-white rounded-lg shadow-lg p-4 mb-6 border border-gray-200">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            fetchRevenueData();
                        }}
                        className="flex flex-wrap items-center gap-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Từ ngày</label>
                            <input
                                type="date"
                                className="mt-1 p-2 border rounded"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Đến ngày</label>
                            <input
                                type="date"
                                className="mt-1 p-2 border rounded"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="mt-5 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Lấy dữ liệu
                        </button>
                    </form>
                </div>

                {isLoading ? (
                    <div className="text-blue-500">Đang tải dữ liệu...</div>
                ) : revenueData.dates.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                        <Bar data={chartData} options={chartOptions} /> {/* Đổi Line thành Bar */}
                        <div className="text-lg font-bold mt-4">
                            Tổng doanh thu:{" "}
                            <span className="text-blue-500">
                                {totalRevenue.toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                })}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500">
                        Không có dữ liệu để hiển thị. Vui lòng kiểm tra lại ngày hoặc thử lại sau.
                    </div>
                )}
            </div>
        </main>
    );
}