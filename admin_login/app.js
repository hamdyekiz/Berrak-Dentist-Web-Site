document.addEventListener("DOMContentLoaded", function () {
	const loginContainer = document.getElementById('login-container');
	const signupContainer = document.getElementById('signup-container');
	const loginLink = document.getElementById('login-link');
	const signupLink = document.getElementById('signup-link');

	loginLink.addEventListener('click', function () {
		loginContainer.style.display = 'block';
		signupContainer.style.display = 'none';
	});

	signupLink.addEventListener('click', function () {
		loginContainer.style.display = 'none';
		signupContainer.style.display = 'block';
	});
});

