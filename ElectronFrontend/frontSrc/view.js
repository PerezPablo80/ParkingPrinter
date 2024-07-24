$(function () {
	function updateTime() {
		const now = new Date();
		const formattedTime = now.toLocaleTimeString();
		$("#timeSpan").text(formattedTime);
	}

	// Update the time immediately and then every second
	updateTime();
	setInterval(updateTime, 1000);
});
$(function () {
	window?.electron?.loadExcel("");
});
