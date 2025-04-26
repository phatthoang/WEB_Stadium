const bookings = {
    "7:00": {
        "Sân W1": {
            name: "Viết Sơn",
            code: "82213",
            price: "200,000đ",
            color: "blue"
        },
        "Sân W2": {
            name: "Mạnh Hà",
            code: "CC5EC",
            price: "140,000đ",
            color: "green"
        },
        "Sân W3": {
            name: "Hồng Thắm",
            code: "1BCC8",
            price: "140,000đ",
            color: "green"
        },
        "Sân W4": {
            name: "Đức Thái",
            code: "7AD6E",
            price: "280,000đ",
            color: "red"
        },
    },
    "8:00": {
        "Sân W1": {
            name: "Huỳnh Nam",
            code: "37571",
            price: "140,000đ",
            color: "green"
        },
        "Sân W2": {
            name: "Nghĩa Phát",
            code: "699F8",
            price: "140,000đ",
            color: "green"
        },
        "Sân W3": {
            name: "Hoàng Hải",
            code: "9D984",
            price: "280,000đ",
            color: "red"
        },
    },
    "9:00": {
        "Sân W1": {
            name: "Tuấn Minh",
            code: "F53F9",
            price: "280,000đ",
            color: "red"
        },
        "Sân W2": {
            name: "Tuấn Thành",
            code: "8E772",
            price: "200,000đ",
            color: "blue"
        },
        "Sân W3": {
            name: "Mạnh Hùng",
            code: "50E29",
            price: "140,000đ",
            color: "green"
        },
    },
    "12:00": {
        "Sân W1": {
            name: "Thành Tâm",
            code: "B64F9",
            price: "140,000đ",
            color: "green"
        },
        "Sân W3": {
            name: "Tuấn Kiệt",
            code: "C8773",
            price: "200,000đ",
            color: "blue"
        },
        "Sân W4": {
            name: "Hào Nam",
            code: "B0S29",
            price: "140,000đ",
            color: "green"
        },
    },
    "15:00": {
        //   "Sân W1": { name: "Minh", code: "F53F9", price: "140,000đ", color: "blue" },
        "Sân W2": {
            name: "Mạnh Tuân",
            code: "8E987",
            price: "200,000đ",
            color: "green"
        },
        "Sân W4": {
            name: "Viết Chiến",
            code: "60E55",
            price: "140,000đ",
            color: "blue"
        },
    },
    "13:00": {
        //   "Sân W1": { name: "Minh", code: "F53F9", price: "140,000đ", color: "blue" },
        "Sân W2": {
            name: "Thế Anh",
            code: "8E772",
            price: "200,000đ",
            color: "blue"
        },
        //   "Sân W4": { name: "Hào", code: "50E29", price: "140,000đ", color: "blue" },
    },
    "6:00": {
        //   "Sân W1": { name: "Minh", code: "F53F9", price: "140,000đ", color: "blue" },
        "Sân W2": {
            name: "Đức Thiện",
            code: "8E772",
            price: "200,000đ",
            color: "blue"
        },
        //   "Sân W4": { name: "Hào", code: "50E29", price: "140,000đ", color: "blue" },
    },

};

const times = ["5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00"
];
const fields = ["Sân W1", "Sân W2", "Sân W3", "Sân W4"];

const tbody = document.getElementById("scheduleBody");

times.forEach(time => {
    const tr = document.createElement("tr");
    const timeCell = document.createElement("td");
    timeCell.textContent = time;
    tr.appendChild(timeCell);

    fields.forEach(field => {
        const td = document.createElement("td");
        if (bookings[time] && bookings[time][field]) {
            const b = bookings[time][field];
            td.innerHTML = `<div class="booking ${b.color}">
        <strong>Tên:</strong> ${b.name}<br/>
        <strong>Mã:</strong> ${b.code}<br/>
        <strong>Giá:</strong> ${b.price}
        </div>`;
        }
        tr.appendChild(td);
    });
    tbody.appendChild(tr);
});

function moModal() {
    document.getElementById('bookingModal').style.display = 'flex';
}

function dongModal() {
    document.getElementById('bookingModal').style.display = 'none';
}
function themLich() {
    const ten = document.getElementById('tenNguoiDat').value;
    const sdt = document.getElementById('soDienThoai').value;
    const san = document.getElementById('chonSan').value; // W1, W2, ...
    const tu = document.getElementById('thoiGianBatDau').value;
    const den = document.getElementById('thoiGianKetThuc').value;
    const ma = document.getElementById('maDatSan').value;
    const khuyenMai = document.getElementById('apDungKhuyenMai').checked;

    if (!ten || !sdt || !tu || !den || !ma) {
        alert("Vui lòng điền đầy đủ thông tin.");
        return;
    }

    const gioBatDau = parseInt(tu.split(":"[0]));
    const gioKetThuc = parseInt(den.split(":"[0]));

    if (gioKetThuc <= gioBatDau) {
        alert("Thời gian kết thúc phải sau thời gian bắt đầu!");
        return;
    }

    const soGio = gioKetThuc - gioBatDau;

    // Tính giá tiền tự động theo khung giờ
    let giaMotGio = 140000;
    if (gioBatDau >= 16 && gioBatDau < 19) {
        giaMotGio = 200000;
    } else if (gioBatDau >= 19 && gioBatDau < 22) {
        giaMotGio = 280000;
    }
    const gia = giaMotGio * soGio;

    const tbody = document.getElementById("scheduleBody");
    const sanIndex = {
        W1: 1,
        W2: 2,
        W3: 3,
        W4: 4
    }[san];

    for (let gio = gioBatDau; gio < gioKetThuc; gio++) {
        const row = tbody.children[gio - 5];
        if (!row) continue;
        const cell = row.children[sanIndex];
        if (!cell || cell.style.display === "none" || cell.innerHTML.trim() !== "") {
            alert(`Sân ${san} đã có người đặt lúc ${gio}:00. Hãy chọn thời gian khác.`);
            return;
        }
    }

    const lich = document.createElement("div");
    lich.classList.add("lich-dat", khuyenMai ? "khuyen-mai" : "khong-km");

    let color = "green";
    if (gia >= 200000 && gia < 280000) color = "blue";
    if (gia >= 280000) color = "red";
    lich.classList.add(color);

    lich.innerHTML = `
        <strong>Tên:</strong> ${ten}<br/>
        <strong>Mã:</strong> ${ma}<br/>
        <strong>Giá:</strong> ${Number(gia).toLocaleString()}đ
    `;

    const rowBatDau = tbody.children[gioBatDau - 5];
    const cellBatDau = rowBatDau.children[sanIndex];
    cellBatDau.rowSpan = soGio;
    cellBatDau.appendChild(lich);

    for (let gio = gioBatDau + 1; gio < gioKetThuc; gio++) {
        const row = tbody.children[gio - 5];
        const cell = row.children[sanIndex];
        cell.style.display = "none";
    }
    dongModal();
}
document.getElementById('thoiGianBatDau').addEventListener('change', tinhGiaTienTuDong);
document.getElementById('thoiGianKetThuc').addEventListener('change', tinhGiaTienTuDong);

function tinhGiaTienTuDong() {
    const tu = document.getElementById('thoiGianBatDau').value;
    const den = document.getElementById('thoiGianKetThuc').value;
    const giaTienInput = document.getElementById('giaTien');

    if (!tu || !den) {
        giaTienInput.value = '';
        return;
    }

    const gioBatDau = parseInt(tu.split(":")[0]);
    const gioKetThuc = parseInt(den.split(":")[0]);

    if (gioKetThuc <= gioBatDau) {
        giaTienInput.value = "Giờ kết thúc không hợp lệ!";
        return;
    }

    const soGio = gioKetThuc - gioBatDau;

    let giaMotGio = 140000;
    if (gioBatDau >= 16 && gioBatDau < 19) {
        giaMotGio = 200000;
    } else if (gioBatDau >= 19 && gioBatDau < 22) {
        giaMotGio = 280000;
    }

    const gia = giaMotGio * soGio;
    giaTienInput.value = gia.toLocaleString() + "đ";
}



