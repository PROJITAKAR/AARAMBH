window.addEventListener('DOMContentLoaded', (event) => {
    if (window.location.search) {
        // Clear query parameters by replacing the URL
        const baseUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, null, baseUrl);
    }
});

const filterBtn = document.getElementById("filterBtn");
const filterModal = document.getElementById("filterModal");
const closeFilterModal = document.getElementById("closeFilterModal");
const applyfilter= document.getElementById("applyBtn");
const clearBtn = document.getElementById("clear");

// Show filter modal
filterBtn.addEventListener("click", () => {
    filterModal.classList.remove("hidden");
});
// Close filter modal
closeFilterModal.addEventListener("click", () => {
    filterModal.classList.add("hidden");
});
// Optional: Close modal if clicked outside
filterModal.addEventListener("click", (e) => {
    if (e.target === filterModal) {
        filterModal.classList.add("hidden");
    }
});
applyfilter.addEventListener("click", ()=>{
    filterModal.classList.add("hidden");
})
clearBtn.addEventListener("click", ()=>{
    filterModal.classList.add("hidden");
})


const searchForm = document.getElementById('searchForm');
const filterForm = document.getElementById('filterForm');
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const searchFormData = new FormData(event.target);
    const filterFormData = new FormData(filterForm);
    submitData(event, searchFormData, filterFormData);
});

filterForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const filterFormData = new FormData(event.target);
    const searchFormData = new FormData(searchForm);
    submitData(event, searchFormData, filterFormData);
});

const submitData = async (event, searchFormData, filterFormData) => {
    const searchParams = new URLSearchParams();
    searchFormData.forEach((value, key) => {
        searchParams.append(key, value);
    });
    filterFormData.forEach((value, key) => {
        searchParams.append(key, value);
    });
    const url = `/searchs/search-bar?${searchParams.toString()}`;
    window.location.href = url;
}

function clearFilters() {
    filterForm.reset();
    document.getElementById('jobType').selectedIndex = 0;
    document.getElementById('citiesList').selectedIndex = 0;
    document.getElementById('minSalary').selectedIndex = 0;
    document.getElementById('maxSalary').selectedIndex = 0;
    document.getElementById('disabilityAccepted').selectedIndex = 0;
    document.getElementById('accessibilityFeatures').selectedIndex = 0;
    document.getElementById('skillsRequired').selectedIndex = 0;
    document.getElementById('company').selectedIndex = 0;
    document.getElementById('jobStatus').selectedIndex = 0;

    const searchFormData = new FormData(searchForm);
    const filterFormData = new FormData(filterForm);
    submitData(event, searchFormData, filterFormData);
}

function clearKeyword(){
    searchForm.reset();
    document.getElementById('keyword').value = '';
    const searchFormData = new FormData(searchForm);
    const filterFormData = new FormData(filterForm);
    submitData(event, searchFormData, filterFormData);
}