// Function to open the product modal
function openModal() {
    document.getElementById("productModal").style.display = "block";
}

// Function to close the modal
function closeModal() {
    document.getElementById("productModal").style.display = "none";
}

// Handle the form submission via AJAX
$(document).ready(function () {
    $("#productFormSubmit").on("submit", function (e) {
        e.preventDefault(); // Prevent default form submission

        var formData = new FormData(this); // Get form data (including file)
        
        // Convert auction date fields to Philippine Time (PHT)
        if (formData.get("auctionStart")) {
            let auctionStart = new Date(formData.get("auctionStart"));
            formData.set("auctionStart", auctionStart.toLocaleString("en-PH", { timeZone: "Asia/Manila" }));
        }
        
        if (formData.get("auctionEnd")) {
            let auctionEnd = new Date(formData.get("auctionEnd"));
            formData.set("auctionEnd", auctionEnd.toLocaleString("en-PH", { timeZone: "Asia/Manila" }));
        }
        
        $.ajax({
            url: "/farmer/addProduct", // Backend route
            type: "POST",
            data: formData,
            contentType: false, // Prevent jQuery from setting contentType
            processData: false, // Prevent jQuery from processing the data
            success: function (response) {
                alert("Product added successfully!");
                closeModal(); // Close the modal on success
                location.reload(); // Reload to reflect changes
            },
            error: function (err) {
                alert("Failed to add product. Please try again.");
                console.error("Error adding product:", err);
            }
        });
    });
});


// Function to show/hide auction fields based on product type selection
function toggleAuctionFields(show) {
    document.getElementById("auctionFields").style.display = show ? "block" : "none";
}

// Convert auction date and time to Philippine format (for displaying)
document.addEventListener("DOMContentLoaded", function () {
    let auctionStart = "<%= product && product.auctionStart ? moment(product.auctionStart).tz('Asia/Manila').format('MMMM D, YYYY h:mm A') : '' %>";
    let auctionEnd = "<%= product && product.auctionEnd ? moment(product.auctionEnd).tz('Asia/Manila').format('MMMM D, YYYY h:mm A') : '' %>";

    if (auctionStart) document.getElementById("auctionStart").value = auctionStart;
    if (auctionEnd) document.getElementById("auctionEnd").value = auctionEnd;
});

// Toggle profile dropdown visibility
function toggleProfileDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Close profile dropdown when clicking outside
document.addEventListener("click", function (event) {
    if (!event.target.closest(".profile-btn") && !event.target.closest("#profileDropdown")) {
        document.getElementById("profileDropdown").style.display = "none";
    }
});

// Toggle settings dropdown visibility
function toggleSettingsDropdown() {
    const settingsDropdown = document.getElementById("settingsDropdown");
    settingsDropdown.style.display = settingsDropdown.style.display === "block" ? "none" : "block";
}

// Close settings dropdown when clicking outside
document.addEventListener("click", function (event) {
    if (!event.target.closest(".settings-button") && !event.target.closest("#settingsDropdown")) {
        document.getElementById("settingsDropdown").style.display = "none";
    }
});


function toggleCategories() {
    const categoryList = document.getElementById("categoryList");
    categoryList.style.display = categoryList.style.display === "block" ? "none" : "block";
}

// Function to filter products based on category


// Function to check if user is logged in before accessing product details or adding to cart
let isLoggedIn = false; // Change this to true for a logged-in user simulation





// Notification toggle
document.getElementById("notificationButton").addEventListener("click", function () {
    const notificationContainer = document.getElementById("notificationContainer");
    notificationContainer.style.display = notificationContainer.style.display === "block" ? "none" : "block";
    
    // Example: Update notification count dynamically
    document.getElementById("notificationCount").innerText = "1";
});

// Function to update the clock every second
function updateClock() {
    const currentTime = document.getElementById("currentTime");
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    currentTime.textContent = `${hours}:${minutes}:${seconds}`;
}

// Start clock updates
updateClock();
setInterval(updateClock, 1000);

function filterProducts(categoryId) {
    console.log('Filtering for category ID:', categoryId); // Check category id value

    const allProducts = document.querySelectorAll('.category-section');
    allProducts.forEach(section => {
        const categoryIdFromSection = section.getAttribute('data-category-id');
        console.log('Product category id:', categoryIdFromSection); // Check product category id

        if (categoryId === categoryIdFromSection || categoryId === 'all') {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
} 
function searchProducts() {
        let input = document.getElementById('searchInput').value.toLowerCase();
        let products = document.querySelectorAll('.product');
            products.forEach(product => {
                let productName = product.getAttribute('data-name');
                    if (productName.includes(input)) {
                        product.style.display = "block";
                    } else {
                        product.style.display = "none";
                    }
    });
    }
function openProductDetails(id, name, price, image) {
    document.getElementById('modalProductName').innerText = name;
    document.getElementById('modalProductPrice').innerText = "Price: ₱" + parseFloat(price).toFixed(2);
    document.getElementById('modalProductImage').src = image ? '/public/img/product/' + image.split('/').pop() : '/public/img/default.png';
        
    document.getElementById('productDetailsModal').style.display = "flex";
    }

    function closeProductDetails() {
        document.getElementById('productDetailsModal').style.display = "none";
    }
    function showProductDetails(event, name, price, image) {
        document.getElementById("popupName").innerText = name;
        document.getElementById("popupPrice").innerText = "Price: ₱" + parseFloat(price).toFixed(2);
        document.getElementById("popupImage").src = image;

        let popup = document.getElementById("productDetailsPopup");
        popup.style.display = "block";
    }

    function hideProductDetails() {
        document.getElementById("productDetailsPopup").style.display = "none";
    }
    //function fetchNotifications() {
     //   fetch('/farmer/notifications')
      //      .then(response => response.json())
      //      .then(data => {
       //         document.getElementById("notificationCount").innerText = data.count;
       //     });
   // }

   // setInterval(fetchNotifications, 5000); // Refresh every 5 seconds