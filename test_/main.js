let MY_BANK = {
    BANK_ID: "MB",
    ACCOUNT_NO: "0379748024",
    ACCOUNT_NAME: "HUYNH TRONG PHUC"
};

const API_KEY = 'AK_CS.4f43129042cd11f0a0f57b99bc550e36.ihD3HcMAESbKyIc6nJREL6k0bYZTRrRz1mslqyMsWRv6p28chcfgMukbOkRkZFYiXZTgPzpf';
// Thay đổi API_GET để bao gồm pageSize=100
const API_GET = 'https://oauth.casso.vn/v2/transactions?pageSize=100'; 

let paymentPollingInterval;
let paymentTimeout;
let countdownInterval;
const PAYMENT_TIMEOUT_SECONDS = 180;
const POLLING_INTERVAL_MILLISECONDS = 15000; // Giảm xuống 15 giây để kiểm tra nhanh hơn

let paymentModalInstance;
let paymentStatusMessageElement;
let progressBarElement;
let timeLeftElement;

let verificationStartTime;
let acceptableStartTime; // Thời gian bắt đầu chấp nhận giao dịch (sau khi lùi lại một chút)

document.addEventListener('DOMContentLoaded', function() {
    console.log("--> [Khởi tạo] DOM đã tải xong. Bắt đầu thiết lập.");
    const paymentModalElement = document.getElementById('paymentModal');
    paymentStatusMessageElement = document.getElementById('paymentStatusMessage');
    progressBarElement = document.getElementById('progressBar');
    timeLeftElement = document.getElementById('timeLeft');

    if (!paymentModalElement) {
        console.error("--> [Lỗi Khởi tạo] Không tìm thấy phần tử HTML của modal thanh toán! Đảm bảo id='paymentModal' là chính xác.");
        return;
    }
    paymentModalInstance = new bootstrap.Modal(paymentModalElement);
    console.log("--> [Khởi tạo] Bootstrap Modal instance đã được tạo.");

    const openPaymentModalBtn = document.querySelector('[data-bs-target="#paymentModal"]');

    if (openPaymentModalBtn) {
        openPaymentModalBtn.addEventListener('click', function() {
            console.log("--> [Sự kiện] Nút mở modal được click.");
            displayMessage('', '');

            const expectedAmount = 200000;
            // Tạo nội dung duy nhất với phần số ở cuối
            const randomCode = Math.floor(100000 + Math.random() * 900000).toString(); 
            const expectedContent = `THANH TOAN SAN W3${randomCode}`; // Ví dụ: THANH TOAN SAN W3123456
            
            console.log(`--> [Thiết lập Modal] Số tiền mong đợi: ${expectedAmount}, Nội dung mong đợi: '${expectedContent}'`);

            const qrAmountElement = document.getElementById('qrAmount');
            const qrContentElement = document.getElementById('qrContent');
            const qrBeneficiaryElement = document.getElementById('qrBeneficiary');

            if (qrAmountElement) qrAmountElement.innerText = expectedAmount.toLocaleString('vi-VN') + 'đ';
            if (qrContentElement) qrContentElement.innerText = expectedContent;
            if (qrBeneficiaryElement) qrBeneficiaryElement.innerText = "HOANG NGHIA PHAT";
            
            paymentModalInstance.show();
            console.log("--> [Thiết lập Modal] Modal thanh toán đã hiển thị.");

            startPaymentVerification(expectedAmount, expectedContent);
        });
    } else {
        console.warn("--> [Cảnh báo Khởi tạo] Không tìm thấy nút mở modal. Đảm bảo có một phần tử với data-bs-target='#paymentModal'.");
    }

    paymentModalElement.addEventListener('hide.bs.modal', function () {
        console.log("--> [Sự kiện] Modal đã đóng.");
        if (paymentPollingInterval || paymentTimeout) {
            stopPaymentVerification();
            displayMessage('Giao dịch chưa hoàn tất hoặc đã bị hủy.', 'failure');
        }
    });
});

function startPaymentVerification(expectedAmount, expectedContent) {
    console.log("--> [Xác minh Thanh toán] Bắt đầu quá trình xác minh.");
    stopPaymentVerification();

    verificationStartTime = Date.now(); 
    // Đặt cửa sổ chấp nhận giao dịch lùi lại 60 giây để chắc chắn bắt được giao dịch ngay cả khi có độ trễ
    acceptableStartTime = verificationStartTime - (60 * 1000); // 60 giây = 60000ms
    
    console.log(`--> [Xác minh Thanh toán] Thời gian mở modal (verificationStartTime): ${new Date(verificationStartTime).toLocaleString()} (${verificationStartTime}ms)`);
    console.log(`--> [Xác minh Thanh toán] Giao dịch sẽ được chấp nhận nếu thời gian GD >= ${new Date(acceptableStartTime).toLocaleString()} (${acceptableStartTime}ms)`);


    let remainingTime = PAYMENT_TIMEOUT_SECONDS;
    progressBarElement.style.width = '100%';
    timeLeftElement.innerText = `00:${String(remainingTime).padStart(2, '0')}`;

    countdownInterval = setInterval(() => {
        remainingTime--;
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const percentage = (remainingTime / PAYMENT_TIMEOUT_SECONDS) * 100;
        progressBarElement.style.width = `${percentage}%`;
        timeLeftElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
    console.log("--> [Xác minh Thanh toán] Countdown timer đã khởi động.");

    paymentPollingInterval = setInterval(async () => {
        console.log(`--> [Polling] Đang gọi checkPaymentStatus (Mỗi ${POLLING_INTERVAL_MILLISECONDS / 1000} giây)...`);
        const isPaid = await checkPaymentStatus(expectedAmount, expectedContent);
        if (isPaid) {
            handlePaymentSuccess();
        }
    }, POLLING_INTERVAL_MILLISECONDS);
    console.log("--> [Xác minh Thanh toán] Polling interval đã khởi động.");

    paymentTimeout = setTimeout(() => {
        console.warn("--> [Timeout] Đã hết thời gian chờ thanh toán.");
        handlePaymentFailure();
    }, PAYMENT_TIMEOUT_SECONDS * 1000);
    console.log("--> [Xác minh Thanh toán] Timeout đã đặt.");
}

function stopPaymentVerification() {
    if (paymentPollingInterval) {
        console.log("--> [Dừng xác minh] Đã dừng paymentPollingInterval.");
        clearInterval(paymentPollingInterval);
        paymentPollingInterval = null;
    }
    if (paymentTimeout) {
        console.log("--> [Dừng xác minh] Đã dừng paymentTimeout.");
        clearTimeout(paymentTimeout);
        paymentTimeout = null;
    }
    if (countdownInterval) {
        console.log("--> [Dừng xác minh] Đã dừng countdownInterval.");
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

async function checkPaymentStatus(expectedAmount, expectedContent) {
    console.log("--> [API Request] Đang kiểm tra giao dịch từ Casso API...");
    
    // API_GET đã được thay đổi ở trên để bao gồm pageSize=100
    // Không thêm fromDate/toDate vào đây
    console.log(`--> [API Request] URL gọi Casso: ${API_GET}`);

    try {
        const response = await fetch(API_GET, { // Gọi với API_GET đã có pageSize=100
            method: 'GET',
            headers: {
                'Authorization': `Apikey ${API_KEY}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => response.text());
            console.error(`--> [API Lỗi] Lỗi HTTP khi gọi Casso API: ${response.status}`, errorData);
            return false;
        }

        const data = await response.json();
        console.log("--> [API Phản hồi] Dữ liệu trả về từ Casso:", data);

        if (data && data.data && Array.isArray(data.data.records) && data.data.records.length > 0) {
            console.log(`--> [Xử lý Giao dịch] Tìm thấy ${data.data.records.length} giao dịch từ Casso. Bắt đầu duyệt...`);
            for (const transaction of data.data.records) {
                console.log(`---- Bắt đầu kiểm tra Giao dịch ID: ${transaction.id || 'Không có ID'} ----`);
                
                const actualAmount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
                
                const transactionTimeStr = transaction.when; 
                let transactionTime;

                if (!transactionTimeStr) {
                    console.warn(`---- [Giao dịch ID: ${transaction.id || 'Không có ID'}] Không tìm thấy chuỗi thời gian (trường 'when'). Bỏ qua giao dịch này.`);
                    continue; 
                }

                try {
                    transactionTime = new Date(transactionTimeStr); 
                    if (isNaN(transactionTime.getTime())) {
                        console.warn(`---- [Giao dịch ID: ${transaction.id || 'Không có ID'}] Không thể parse thời gian giao dịch: '${transactionTimeStr}'. Bỏ qua giao dịch này.`);
                        continue;
                    }
                } catch (e) {
                    console.error(`---- [Giao dịch ID: ${transaction.id || 'Không có ID'}] Lỗi khi parse thời gian giao dịch '${transactionTimeStr}':`, e);
                    continue;
                }

                const isAmountMatch = actualAmount >= expectedAmount;
                const isContentMatch = transaction.description && transaction.description.toLowerCase().includes(expectedContent.toLowerCase());
                
                // Vẫn giữ điều kiện thời gian này, dựa vào `acceptableStartTime`
                const isTimeMatch = transactionTime.getTime() >= acceptableStartTime; 

                console.log(`---- [Giao dịch ID: ${transaction.id || 'Không có ID'}]`);
                console.log(`    - Số tiền: ${actualAmount} (>= ${expectedAmount}) -> Kết quả: ${isAmountMatch}`);
                console.log(`    - Nội dung: '${transaction.description}' (Chứa '${expectedContent}') -> Kết quả: ${isContentMatch}`);
                console.log(`    - Thời gian GD: ${transactionTime.toLocaleString()} (${transactionTime.getTime()}ms)`);
                console.log(`    - Thời gian bắt đầu chấp nhận: ${new Date(acceptableStartTime).toLocaleString()} (${acceptableStartTime}ms)`);
                console.log(`    - Điều kiện thời gian (GD >= Bắt đầu chấp nhận): ${isTimeMatch}`);
                
                console.log(`----> KẾT QUẢ TỔNG THỂ cho ID ${transaction.id || 'Không có ID'}: ${isAmountMatch && isContentMatch && isTimeMatch}`);

                if (isAmountMatch && isContentMatch && isTimeMatch) {
                    console.log("-----> Đã tìm thấy GIAO DỊCH PHÙ HỢP và MỚI, THÀNH CÔNG!", transaction);
                    return true;
                }
            }
            console.log("--> [Xử lý Giao dịch] Không tìm thấy giao dịch phù hợp trong các bản ghi hiện có từ Casso (sau khi duyệt và lọc).");
        } else if (data && data.data && Array.isArray(data.data.records) && data.data.records.length === 0) {
            console.log("--> [Xử lý Giao dịch] Casso API trả về data.data.records rỗng (không có giao dịch nào).");
        } else {
            console.log("--> [Xử lý Giao dịch] Cấu trúc dữ liệu Casso API trả về không như mong đợi (thiếu data.data.records hoặc data.data).");
            console.log("--> [API Phản hồi Đầy đủ] Phản hồi Casso đầy đủ:", data);
        }
        return false;

    } catch (error) {
        console.error("--> [API Lỗi] Lỗi network hoặc parse JSON khi gọi Casso API:", error);
        return false;
    }
}

function handlePaymentSuccess() {
    console.log("--> [Kết quả] Xử lý thành công thanh toán.");
    stopPaymentVerification();
    if (paymentModalInstance) {
        paymentModalInstance.hide();
    }
    displayMessage('Đặt lịch thành công! Cảm ơn bạn đã thanh toán.', 'success');
    // TODO: Thêm logic để cập nhật lịch vào bảng chính hoặc gửi dữ liệu lên server
}

function handlePaymentFailure() {
    console.log("--> [Kết quả] Xử lý thất bại thanh toán (hết thời gian chờ).");
    stopPaymentVerification();
    if (paymentModalInstance) {
        paymentModalInstance.hide();
    }
    displayMessage('Giao dịch thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.', 'failure');
}

function displayMessage(message, type) {
    if (paymentStatusMessageElement) {
        paymentStatusMessageElement.innerText = message;
        paymentStatusMessageElement.className = 'message-box';
        if (type) {
            paymentStatusMessageElement.classList.add(type);
            paymentStatusMessageElement.style.display = 'block';
        } else {
            paymentStatusMessageElement.style.display = 'none';
        }
    }
}