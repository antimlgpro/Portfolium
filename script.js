const canvas = document.getElementById("background");
const mainElement = document.getElementById("main");
const navElement = document.getElementById("nav");
const ctx = canvas.getContext("2d");
const backgroundColor = getComputedStyle(
	document.documentElement
).getPropertyValue("--background-color");

const colors = ["#fff", "#ffccff", "#ccffcc"];
const positions = [];

const visualRange = 100;

const init = () => {
	const width = window.innerWidth;
	const height = window.innerHeight;
	
	// 1. Multiply the canvas's width and height by the devicePixelRatio
	const ratio = window.devicePixelRatio || 1
	canvas.width = width * ratio
	canvas.height = height * ratio
	
	// 2. Force it to display at the original (logical) size with CSS or style attributes
	canvas.style.width = width + 'px'
	canvas.style.height = height + 'px'
	
	// 3. Scale the context so you can draw on it without considering the ratio.
	ctx.scale(ratio, ratio)

	// Initialize points on the canvas
	for (let index = 0; index < 1200; index++) {
		createPoint();
	}

	gameLoop();
};

const createPoint = () => {
	let color = colors[Math.floor(Math.random() * colors.length)];
	positions.push({
		x: randomFloat(0, canvas.width / 2),
		y: randomFloat(0, canvas.height / 2),
		dx: randomFloat(-5, 5),
		dy: randomFloat(-5, 5),
		scale: randomFloat(1, 5),
		initialColor: color,
		color: color,
	});
}

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

		//point.dx += ((canvas.width / 2) - point.x) * 0.005;
		//point.dy += ((canvas.height / 2) - point.y) * 0.005;
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
	const speedLimit = 10;

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
	const margin = 100;
	const turnFactor = 1;

	const width = canvas.width / 2;
	const height = canvas.height / 2;

	//point.x = Math.min(Math.max(point.x, -5), width + 5);
	//point.y = Math.min(Math.max(point.y, -5), height + 5);
  
	if (point.x < margin) {
	  point.dx += turnFactor;
	}
	if (point.x > width - margin) {
	  point.dx -= turnFactor
	}
	if (point.y < margin) {
	  point.dy += turnFactor;
	}
	if (point.y > height - margin) {
	  point.dy -= turnFactor;
	}
};

const avoidOthers = (point) => {
	const minDistance = 35;
	const avoidFactor = 0.02; // Adjust velocity by this %
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
}

var counter = 0;

const gameLoop = () => {
	var lastTime = 0;
	var requiredElapsed = 1 / 60;

	const internalGameLoop = (now) => {
		//ctx.fillStyle = backgroundColor;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (!lastTime) {
			lastTime = now;
		}
		let deltaTime = now - lastTime;

		if (deltaTime > requiredElapsed) {
			// do stuff
			lastTime = now;
		}

		counter++;

		for (let i = 0; i < positions.length; i++) {
			let point = positions[i];

			if (counter >= 100) {
				point.color = point.initialColor;
				point.initialColor = colors[Math.floor(Math.random() * colors.length)];
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

		window.requestAnimationFrame(internalGameLoop);
	};

	window.requestAnimationFrame(internalGameLoop);
};

init();
