const buttons = document.querySelectorAll(".tab-button");
const contents = document.querySelectorAll(".tab-content");

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const tabId = button.getAttribute("data-tab");

    // reset styles
    buttons.forEach(btn => btn.classList.remove("border-orange-600", "text-orange-900"));
    contents.forEach(content => content.classList.remove("active"));

    // activate selected
    button.classList.add("border-orange-600", "text-orange-900");
    document.getElementById(tabId).classList.add("active");
  });
});
