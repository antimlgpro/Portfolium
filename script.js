self.onmessage = (e) => {
	const canvas = e.data.canvas;
	const width = e.data.width;
	const height = e.data.width;
	const ratio = e.data.ratio;
	const ctx = canvas.getContext("2d");

	const colors = [
		"#ffffff", // White
		"#e6e6e6", // Very Light Gray
		"#cccccc", // Light Gray
		"#b3b3b3", // Lighter Gray
		"#999999", // Gray
		"#808080", // Medium Gray
		"#666666", // Dark Gray
		"#4d4d4d", // Darker Gray
		"#333333", // Very Dark Gray
		"#2b2b2b", // Near Black
		"#242424", // Darker Gray-Black
		"#1d1d1d", // Dark Black
		"#161616", // Deep Black
	];
	const positions = [];

	const visualRange = 100;
	var counter = 0;

	const createPoint = () => {
		let color = colors[Math.floor(Math.random() * colors.length)];
		positions.push({
			x: randomFloat(0, canvas.width / ratio),
			y: randomFloat(0, canvas.height / ratio),
			dx: randomFloat(-5, 5),
			dy: randomFloat(-5, 5),
			scale: randomFloat(1, 2),
			initialColor: color,
			color: color,
		});
	};

	const drawCircles = (point) => {
		ctx.fillStyle = point.color;
		ctx.beginPath();
		ctx.arc(point.x, point.y, point.scale, 0, 2 * Math.PI);
		ctx.fill();
	};

	const moveTowardsCenter = (point) => {
		const factor = 0.02;
		let centerX = 0;
		let centerY = 0;
		let numNeighbors = 0;

		for (let otherPoint of positions) {
			if (distance(point, otherPoint) < visualRange) {
				centerX += otherPoint.x;
				centerY += otherPoint.y;
				numNeighbors += 1;
			}
		}

		if (numNeighbors) {
			centerX = centerX / numNeighbors;
			centerY = centerY / numNeighbors;

			point.dx += (centerX - point.x) * factor;
			point.dy += (centerY - point.y) * factor;

			//point.dx += ((canvas.width / 2) - point.x) * 0.0005;
			//point.dy += ((canvas.height / 2) - point.y) * 0.0005;
		}
	};

	const matchVelocity = (point) => {
		const matchingFactor = 0.02; // Adjust by this % of average velocity

		let avgDX = 0;
		let avgDY = 0;
		let numNeighbors = 0;

		for (let otherPoint of positions) {
			if (distance(point, otherPoint) < visualRange) {
				avgDX += otherPoint.dx;
				avgDY += otherPoint.dy;
				numNeighbors += 1;
			}
		}

		if (numNeighbors) {
			avgDX = avgDX / numNeighbors;
			avgDY = avgDY / numNeighbors;

			point.dx += (avgDX - point.dx) * matchingFactor;
			point.dy += (avgDY - point.dy) * matchingFactor;
		}
	};

	const limitSpeed = (point) => {
		const speedLimit = 0.7;

		const speed = Math.sqrt(point.dx * point.dx + point.dy * point.dy);
		if (speed > speedLimit) {
			point.dx = (point.dx / speed) * speedLimit;
			point.dy = (point.dy / speed) * speedLimit;
		}
	};

	const randomFloat = (min, max) => {
		return Math.random() * (max - min) + min;
	};

	const distance = (point1, point2) => {
		// Distance
		let a = point1.x - point2.x;
		let b = point1.y - point2.y;

		let distance = Math.sqrt(a * a + b * b);
		return distance;
	};

	const keepWithinBounds = (point) => {
		const margin = 0;
		const turnFactor = 1;

		const width = canvas.width / ratio;
		const height = canvas.height / ratio;

		//point.x = Math.min(Math.max(point.x, -5), width + 5);
		//point.y = Math.min(Math.max(point.y, -5), height + 5);

		if (point.x < margin) {
			point.dx += turnFactor;
		}
		if (point.x > width - margin) {
			point.dx -= turnFactor;
		}
		if (point.y < margin) {
			point.dy += turnFactor;
		}
		if (point.y > height - margin) {
			point.dy -= turnFactor;
		}
	};

	const avoidOthers = (point) => {
		const minDistance = 80;
		const avoidFactor = 0.01; // Adjust velocity by this %
		let moveX = 0;
		let moveY = 0;
		for (let otherPoint of positions) {
			if (otherPoint !== point) {
				if (distance(point, otherPoint) < minDistance) {
					moveX += point.x - otherPoint.x;
					moveY += point.y - otherPoint.y;
				}
			}
		}

		point.dx += moveX * avoidFactor;
		point.dy += moveY * avoidFactor;
	};

	const matchGroups = (point) => {
		const minDistance = 80;

		let neighbours = [];
		neighbours.push(point);

		for (let otherPoint of positions) {
			if (otherPoint !== point) {
				if (distance(point, otherPoint) < minDistance) {
					neighbours.push(otherPoint);
				}
			}
		}

		point.color = point.initialColor;
		for (let neighbour of neighbours) {
			neighbour.color = point.color;
		}
	};

	const gameLoop = () => {
		var lastTime = 0;
		var requiredElapsed = 1 / 15;

		const internalGameLoop = (now) => {
			//ctx.fillStyle = backgroundColor;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			if (!lastTime) {
				lastTime = now;
			}
			let deltaTime = now - lastTime;

			if (deltaTime > requiredElapsed) {
				// do stuff
				counter++;

			for (let i = 0; i < positions.length; i++) {
				let point = positions[i];

				if (counter >= 100) {
					point.color = point.initialColor;
					point.initialColor =
						colors[Math.floor(Math.random() * colors.length)];
					counter = 0;
				}

				moveTowardsCenter(point);
				matchGroups(point);
				matchVelocity(point);
				avoidOthers(point);
				limitSpeed(point);

				drawCircles(point);

				point.x += point.dx;
				point.y += point.dy;

				keepWithinBounds(point);

				}

				lastTime = now;
			}

			requestAnimationFrame(internalGameLoop);
		};

		requestAnimationFrame(internalGameLoop);
	};

	const init = () => {
		// 1. Multiply the canvas's width and height by the devicePixelRatio
		canvas.width = width * ratio;
		canvas.height = height * ratio;

		// 3. Scale the context so you can draw on it without considering the ratio.
		ctx.scale(ratio, ratio);

		// Initialize points on the canvas
		for (let index = 0; index < 1200; index++) {
			createPoint();
		}

		gameLoop();
	};

	init();
};
