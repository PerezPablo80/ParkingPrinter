$(function () {
	function updateTime() {
		const now = new Date();
		const formattedTime = now.toLocaleTimeString();
		$("#timeSpan").text(formattedTime);
		const formattedDate = now.getFullYear() + "-" + (Number(now.getMonth()) + 1) + "-" + now.getDate();
		$("#dateSpan").text(formattedDate);
	}

	// Update the time immediately and then every second
	updateTime();
	setInterval(updateTime, 1000);
});
// $(function () {
// 	window?.electron?.loadExcel("");
// });
