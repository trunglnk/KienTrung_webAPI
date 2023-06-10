let user = document.getElementById("username");
let password = document.getElementById("password");
let token = "";

const endpoint = "https://httpdl.howizbiz.com/api/";
let itemsPerPage = 5;
let page = 1;
let search = "";
const routers = {
  login: "web-authenticate",
  users: "users",
  roles: "roles",
  userLogin: "me",
  logOut: "web-logout"
};

function loadData() {
  let url = endpoint + routers.login;
  console.log(url);
  const xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    let response = JSON.parse(xhttp.responseText);
    let access_token = response.access_token;
    localStorage.setItem("token", access_token);
    if (xhttp.status == 200) {
      getLoggedInUser();
      window.location.href = "./users.html";
    } else {
      showError(user, "Tài khoản đăng nhập không chính xác");
      showError(password, "Mật khẩu không chính xác");
    }
  };
  xhttp.open("POST", url);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("username=" + user.value + "&password=" + password.value);
}

//BÁO LỖI LOGIN
function showError(input, message) {
  let parent = input.parentElement;
  let span = document.createElement("span");
  let children = parent.appendChild(span);
  children.classList.add("error");
  children.innerText = message;
}


//USER DATA
userData(page, itemsPerPage);
function userData(page, itemsPerPage) {
  let url = endpoint + routers.users;
  url +=
    "?with=roles,createdBy&paginate=true&page=" +
    page +
    "&itemsPerPage=" +
    itemsPerPage +
    "&search=" +
    search;
  const xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    var response = JSON.parse(xhttp.responseText);
    var data = response.list;
    console.log(data);
    renderTable(data);
  };
  xhttp.open("GET", url);
  xhttp.setRequestHeader(
    "Authorization",
    "Bearer " + localStorage.getItem("token")
  );
  xhttp.send();
}

//RENDER TABLE
function renderTable(data) {
  let table = document.getElementById("table");
  let text = "";
  for (let i = 0; i < data.length; i++) {
    let dateTimeParts = data[i].created_at.split("T");
    let datePart = dateTimeParts[0];
    // Chuyển đổi định dạng ngày
    let dateParts = datePart.split("-");
    let formattedDate = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];

    let roles = ""; // Chuỗi roles
    for (let j = 0; j < data[i].roles.length; j++) {
      roles += `<span class="role mx-1 px-2 py-1" style="background-color: ${data[i].roles[j].meta.color}">${data[i].roles[j].name}</span>`;
    }

    if (data[i].inactive === true) {
      let checked = document.querySelector(".checked");
      checked.removeAttribute("checked");
    }

    text += `
			<tr>
				<td>${data[i].name}</td>
				<td>${data[i].username}</td>
				<td>${data[i].mobile}</td>
				<td>
                    <label class="switch">
                     <input class="checked" type="checkbox" checked>
                     <span class="slider round"></span>
                     </label>
                </td>
				<td>${roles}</td>
				<td>${formattedDate}</td>
				<td>
				<button onclick="editUser('${data[i].id}')" data-bs-toggle="modal" data-bs-target="#modalEdit"><i class='bx bxs-edit' ></i></button>
				<button  onclick="getNameDelete('${data[i].username}'); getIdDelete('${data[i].id}')"  data-bs-toggle="modal" data-bs-target="#deleteModal"><i class='bx bx-trash' ></i></button>
				</td>
			</tr>
		`;
  }
  table.innerHTML = text;
}

//PAGINATE
function changeItemsPerPage(value) {
  itemsPerPage = value;
  userData(page, itemsPerPage);
  // console.log(itemsPerPage)
}

//RendList ROLE
getSelect();
let selection;

function getSelect() {
  let url = endpoint + routers.roles;
  var xhttp = new XMLHttpRequest();
  xhttp.onload = function () {
    selection = JSON.parse(xhttp.responseText);
    var cboQuyen = document.getElementById("cboQuyen");
    var filterRole = document.getElementById("filter-role");
    var editcboQuyen = document.getElementById("edit-cboQuyen");
    for (var i = 0; i < selection.length; i++) {
      cboQuyen.innerHTML += `<option value='${selection[i].id}'>${selection[i].name}</option>`;
      filterRole.innerHTML += `<option value='${selection[i].id}'>${selection[i].name}</option>`;
      editcboQuyen.innerHTML += `<option value='${selection[i].id}'>${selection[i].name}</option>`;
    }
    // console.log(selecttion);
  };
  xhttp.open("GET", url);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
    "Authorization",
    "Bearer " + localStorage.getItem("token")
  );
  xhttp.send();
}

//ADD USER
function addUser() {
  let url = endpoint + routers.users;
  let name = document.getElementById("nameUser").value;
  let username = document.getElementById("usernameUser").value;
  let email = document.getElementById("email").value;
  let phone = document.getElementById("mobile").value;
  let password = document.getElementById("pwd").value;
  let confirmPassword = document.getElementById("confirm-pwd").value;
  let roleIds = Array.from(
    document.getElementById("cboQuyen").selectedOptions
  ).map((option) => option.value);

  // Kiểm tra mật khẩu và mật khẩu xác nhận
  if (password !== confirmPassword) {
    showError(
      document.getElementById("confirm-pwd"),
      "Mật khẩu xác nhận không khớp"
    );
    return;
  }

  // Tạo đối tượng người dùng mới
  let newUser = {
    name: name,
    username: username,
    email: email,
    mobile: phone,
    password: password,
    password_confirmation: confirmPassword,
    role_ids: roleIds,
  };

  // Gửi yêu cầu Ajax để thêm người dùng mới
  const xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    if (xhttp.status == 200) {
      userData(page, itemsPerPage);
      alert("Thêm mới User thành công!");
    } else {
      // Nếu có lỗi, hiển thị thông báo lỗi
      let response = JSON.parse(xhttp.responseText);
      showError(document.getElementById("username"), response.message);
    }
  };
  xhttp.open("POST", url);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
    "Authorization",
    "Bearer " + localStorage.getItem("token")
  );
  xhttp.send(JSON.stringify(newUser));
  console.log(JSON.stringify(newUser));
}

let table = document.querySelector("#table");

function clearTable() {
  let tr = table.getElementsByTagName("tr");
  for (let i = 0; i < tr.length; i++) {
    tr[i].innerHTML = "";
  }
}

//FILTER ROLE
let filterrole = document.querySelector("#filter-role");
filterrole.addEventListener("change", fn_searchRole);

function fn_searchRole() {
  let input = filterrole.value;
  let url = endpoint + routers.users;
  url +=
    "?with=roles,createdBy&paginate=true&page=" +
    page +
    "&itemsPerPage=" +
    itemsPerPage +
    "&search=&role_id=" +
    input;
  // console.log(url)

  const xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    let respone = JSON.parse(xhttp.responseText);
    let data = respone.list;
    if (input != "") {
      clearTable();
      renderTable(data);
    } else {
      userData(page, itemsPerPage);
    }
  };
  xhttp.open("GET", url);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
    "Authorization",
    " Bearer " + localStorage.getItem("token")
  );
  xhttp.send();
}

//FILTER STATUS
let filterStatus = document.querySelector("#filter-status");
filterStatus.addEventListener("change", fn_searchStatus);

function fn_searchStatus() {
  let input = fn_searchStatus.value;
  let url = endpoint + routers.users;
  url +=
    "?with=roles,createdBy&paginate=true&page=" +
    page +
    "&itemsPerPage=" +
    itemsPerPage +
    "&search=&inactive=" +
    input;
  console.log(url);

  const xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    let respone = JSON.parse(xhttp.responseText);
    let data = respone.list;
    if (input != "") {
      clearTable();
      renderTable(data);
    } else {
      userData(page, itemsPerPage);
    }
  };
  xhttp.open("GET", url);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
    "Authorization",
    " Bearer " + localStorage.getItem("token")
  );
  xhttp.send();
}

//FILTER DATE
let startDate = document.querySelector("#startDate");
startDate.addEventListener("change", fn_createDate);

function fn_createDate(e) {
  let date = e.target.value;
  let day = date.split("-").reverse().join("%2F");
  let endDateValue = document.querySelector("#endDate").value;
  let endDateDay = endDateValue.split("-").reverse().join("%2F");
  let url = endpoint + routers.users;
  url +=
    "?with=roles,createdBy&paginate=true&page=" +
    page +
    "&itemsPerPage=" +
    itemsPerPage +
    "&search=&date_start=" +
    `${day}` +
    "&date_end=" +
    `${endDateDay}`;
  const xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    let response = JSON.parse(xhttp.responseText);
    let data = response.list;
    // let list = response.pagination.total;
    if (xhttp.status == 200) {
      clearTable();
      renderTable(data);
      // fn_page(currentPage, Math.ceil(list / itemsPerPage));
    } else {
      userData(page, itemsPerPage);
    }
  };
  xhttp.open("GET", url);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
    "Authorization",
    " Bearer " + localStorage.getItem("token")
  );
  xhttp.send();
}

let endDate = document.querySelector("#endDate");
endDate.addEventListener("change", fn_createDateEnd);

function fn_createDateEnd(e) {
  let date = e.target.value;
  let day = date.split("-").reverse().join("%2F");
  let startDateValue = document.querySelector("#startDate").value;
  let startDateDay = startDateValue.split("-").reverse().join("%2F");
  let url = endpoint + routers.users;

  url +=
    "?with=roles,createdBy&paginate=true&page=" +
    page +
    "&itemsPerPage=" +
    itemsPerPage +
    "&search=&date_start=" +
    `${startDateDay}` +
    "&date_end=" +
    `${day}`;
  const xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    let response = JSON.parse(xhttp.responseText);
    let data = response.list;
    // let list = response.pagination.total;
    if (xhttp.status == 200) {
      clearTable();
      renderTable(data);
      // fn_page(currentPage, Math.ceil(list / itemsPerPage));
    } else {
      userData(page, itemsPerPage);
    }
  };
  xhttp.open("GET", url);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
    "Authorization",
    " Bearer " + localStorage.getItem("token")
  );
  xhttp.send();
}

//INPUT SEARCH
let search_input = document.querySelector("#search-input");
search_input.addEventListener("keyup", fn_searchName);

function fn_searchName() {
  let input = search_input.value;
  let url = endpoint + routers.users;

  url +=
    "?with=roles,createdBy&paginate=true&page=" +
    page +
    "&itemsPerPage=" +
    itemsPerPage +
    "&search=" +
    input;

  const xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    let respone = JSON.parse(xhttp.responseText);
    let data = respone.list;
    if (input != "") {
      clearTable();
      renderTable(data);
    } else {
      userData(page, itemsPerPage);
    }
  };
  xhttp.open("GET", url);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
    "Authorization",
    " Bearer " + localStorage.getItem("token")
  );
  xhttp.send();
}

//DELETE
function getIdDelete(id) {
  const deleteHandler = function () {
    deleteUser(id);
  };
  document.getElementById("delete").onclick = deleteHandler;
}
function deleteUser(userId) {
  let url = endpoint + routers.users;

  const xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    if (xhttp.status == 200) {
      userData(page, itemsPerPage);
      alert("Xóa Thành Công");
    } else {
      let response = JSON.parse(xhttp.responseText);
      alert("Lỗi xóa rồi");
    }
  };
  xhttp.open("DELETE", `${url}/${userId}`);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
    "Authorization",
    "Bearer " + localStorage.getItem("token")
  );
  xhttp.send();
}

function getNameDelete(name) {
  let alertDelete = document.querySelector("#body-delete");
  let content = `Bạn có chắc muốn xóa <strong>${name}</strong>? Điều này hoàn toàn không thể hoàn tác!`;
  alertDelete.innerHTML = content;
  console.log(content);
}

//ADD USER
function editUser(userId) {

  let url = endpoint + routers.users + "/" + userId;
  console.log(url);
  const xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    if (xhttp.status == 200) {
      let user = JSON.parse(xhttp.responseText);
      document.getElementById("edit-name").value = user.name;
      document.getElementById("edit-username").value = user.username;
      document.getElementById("edit-email").value = user.email;
      document.getElementById("edit-mobile").value = user.mobile;
      // document.getElementById("edit-cboQuyen").value = user.roles
      // let text = "";
      // for (let i = 0; i < user.roles.length; i++) {
      //   text += `<option value="${user.roles[i].id}">${user.roles[i].name}</option>`;
      // }
      // document.getElementById("edit-cboQuyen").innerHTML = text;
      // console.log(user.roles)

      let saveButton = document.getElementById("update-btn");
      saveButton.setAttribute("data-user-id", userId);
    } else {
      alert("Lỗi khi lấy thông tin người dùng");
    }
  };
  xhttp.open("GET", url);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
    "Authorization",
    "Bearer " + localStorage.getItem("token")
  );
  xhttp.send();
}

function updateUser() {
  let userId = document
    .getElementById("update-btn")
    .getAttribute("data-user-id");
  let url = endpoint + routers.users + "/" + userId;
  let name = document.getElementById("edit-name").value;
  let username = document.getElementById("edit-username").value;
  let email = document.getElementById("edit-email").value;
  let phone = document.getElementById("edit-mobile").value;
  let roleId = document.getElementById("edit-cboQuyen").value;

  let updatedUser = {
    name: name,
    username: username,
    email: email,
    mobile: phone,
    role_id: roleId,
    id: userId
  };

  const xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    if (xhttp.status == 200) {
      userData(page, itemsPerPage);
      alert("Cập nhật User thành công!");
    } else {
      let response = JSON.parse(xhttp.responseText);
      alert("Lỗi khi cập nhật User: " + response.message);
    }
  };
  xhttp.open("PUT", url);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
    "Authorization",
    "Bearer " + localStorage.getItem("token")
  );
  xhttp.send(JSON.stringify(updatedUser));
}

//GET USER LOGIN
function getLoggedInUser() {
  let url = endpoint + routers.userLogin;
  const xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    if (xhttp.status == 200) {
      let user = JSON.parse(xhttp.responseText);
      let dataUser = user.user
      console.log(dataUser)
      let userProfile = document.querySelector("#user-logined")
      let content = `<img
            src="${dataUser.avatar_url}"
            width="40"
            height="40"
            class="d-inline-block align-top"
            alt=""
          />
          ${dataUser.name}`
      userProfile.innerHTML = content

      //In thong tin ra Box
      let card = document.querySelector("#card")
      let text = `<div class="d-flex justify-content-center">
        <img class="card-img-top mt-2" src="${dataUser.avatar_url}" alt="Card image" style="width:30%; height: auto; border-radius: 50%; border: 1px solid green">
        </div>
          <div class="card-body text-center" id="card-body">
          <h4 class="card-title text-center">${dataUser.name}</h4>
          <button type="button" class="btn btn-outline-secondary my-2">${dataUser.role.name}</button>
          <div class="d-flex justify-content-between">
          <button  type="button" onclick="getProfile()" class="btn btn-primary text-decoration-none text-light">Hồ sơ</button>
          <button  type="button" onclick="logout()" class="btn btn-danger text-decoration-none text-light">Đăng xuất</button>
          </div>
        </div>`

      card.innerHTML = text

      //In thong tin ra trang profile
      let avtPro = document.querySelector("#avt-profile")
      let contentAvt = `<img src="${dataUser.avatar_url}" alt="Avatar">
              <div class="add-button">
                <i class="bx bx-plus"></i>
              </div>`
      avtPro.innerHTML = contentAvt

      let formPro = document.querySelector("#form-profile")
      let contentForm = `<div class="mb-3 mt-3">
                      <label class="form-label">Tên hiển thị:</label>
                      <input type="text" class="form-control" id="name-show" name="nameShow" value="${dataUser.name}">
                    </div>
                    <div class="mb-3 mb-3">
                      <label class="form-label">Số điện thoại</label>
                      <input type="text" class="form-control" id="phone"  name="phone" value="${dataUser.mobile}">
                    </div>
                    <button type="submit" class="btn btn-success">Lưu</button>`
      formPro.innerHTML = contentForm

    } else {
      console.error("Lỗi khi lấy thông tin tài khoản đăng nhập");
    }
  };
  xhttp.open("GET", url);
  xhttp.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
  xhttp.send();
}
getLoggedInUser()

//BẬT TẮT BOX USER
function showBox(){
  let x = document.querySelector("#card")
  if (x.style.display === 'none') {
    x.style.display = 'block';
  } else {
    x.style.display = 'none';
  }
}

let userLogin = document.querySelector("#user-logined")
userLogin.addEventListener("click", showBox)

//CHUYỂN TRANG HỒ SƠ
function getProfile(){
  let mainUser = document.querySelector("#main-user")
  mainUser.innerHTML = ""

  let mainPro = document.querySelector('#main-profile')
  mainPro.style.display = 'block'
}

//LOGOUT
function logout() {
  let url = endpoint + routers.logOut;
  const xhttp = new XMLHttpRequest();
  xhttp.onload = () => {
    if (xhttp.status == 200) {
      localStorage.removeItem("token");
      window.location.href = "./login.html";
    } else {
      alert("Đăng xuất không thành công");
    }
  };
  xhttp.open("POST", url);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader(
      "Authorization",
      "Bearer " + localStorage.getItem("token")
  );
  xhttp.send();
}