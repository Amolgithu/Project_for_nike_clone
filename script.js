// Three.js setup for 3D sneaker model
let scene, camera, renderer, sneakerModel, controls; // Added controls variable
// Removed mouseX, mouseY, targetRotationX, targetRotationY, rotationSpeed, dampingFactor as OrbitControls handles this

// Variables for floating animation
const floatAmplitude = 0.3; // How high the shoe floats up and down
const floatSpeed = 0.0009; // How fast the shoe floats

function initThreeJS() {
    // Reference the hero section as the container for mouse events and canvas sizing
    const heroSection = document.querySelector('.hero');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const canvas = document.getElementById('sneakerCanvas');

    // Scene
    scene = new THREE.Scene();
    // Set background of the scene to null for transparency
    scene.background = null; 

    // Camera
    // PerspectiveCamera( fov, aspect, near, far )
    camera = new THREE.PerspectiveCamera(50, heroSection.clientWidth / heroSection.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5); // Position the camera to view the model

    // Renderer
    // Ensure alpha is true for transparency
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Improve rendering quality on high-DPI screens
    renderer.shadowMap.enabled = true; // Enable shadows for more realistic rendering
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

    // Lights
    // Ambient Light: Provides overall illumination, preventing completely dark areas.
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light
    scene.add(ambientLight);

    // Directional Light: Simulates sunlight, creating distinct shadows.
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7); // Position the light
    directionalLight.castShadow = true; // Enable shadow casting for this light
    scene.add(directionalLight);

    // Set up shadow properties for the directional light
    directionalLight.shadow.mapSize.width = 1024; // Shadow map resolution
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5; // Near plane for shadow camera
    directionalLight.shadow.camera.far = 50; // Far plane for shadow camera
    // Adjust shadow camera frustum to encompass the model
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 5;
    directionalLight.shadow.camera.top = 5;
    directionalLight.shadow.camera.bottom = -5;

    // Add a Point Light
    // PointLight( color, intensity, distance, decay )
    const pointLight = new THREE.PointLight(0xffffff, 1, 100); // White light, intensity 1, effective up to 100 units
    pointLight.position.set(-3, 2, 3); // Position the point light (e.g., top-left-front)
    pointLight.castShadow = true; // Enable shadow casting for this light
    scene.add(pointLight);

    // Optional: Add a helper to visualize the point light's position
    // const sphereSize = 0.2;
    // const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    // scene.add(pointLightHelper);

    // Initialize OrbitControls
    // Pass the camera and the renderer's DOM element (canvas) to the controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable damping (inertia) for smoother controls
    controls.dampingFactor = 0.05; // Adjust damping factor
    controls.screenSpacePanning = false; // Prevents panning in screen space
    controls.minDistance = 2; // Minimum zoom distance
    controls.maxDistance = 10; // Maximum zoom distance
    controls.enablePan = false; // Disable panning if you only want rotation
    controls.target.set(0, -0.5, 0); // Set the target to the model's approximate center
    controls.update(); // Update controls after setting target

    // Load GLB Model
    // Correctly instantiate GLTFLoader using the THREE namespace
    const loader = new THREE.GLTFLoader(); 
    // Using the user-provided shoe.glb file
    const glbModelUrl = './shoe.glb'; // Path to your GLB file in the public directory

    loader.load(glbModelUrl, (gltf) => {
        sneakerModel = gltf.scene;
        // Scale the model to fit the scene
        // You might need to adjust these values depending on the size of your shoe.glb model
        sneakerModel.scale.set(3,3,3); 
        // Position the model
        // You might need to adjust these values depending on the origin of your shoe.glb model
        sneakerModel.position.set(2, 2, 0); 

        // Removed sneakerModel.rotation.set as OrbitControls will manage rotation
        // sneakerModel.rotation.set(0.5, 0.5, 0); 

        // Traverse the model to enable shadow casting and receiving
        sneakerModel.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;    // Make the model cast shadows
                node.receiveShadow = true; // Make the model receive shadows
            }
        });

        scene.add(sneakerModel);
        loadingIndicator.style.display = 'none'; // Hide loading indicator once model is loaded
        animate(); // Start animation loop after model is loaded
    }, (xhr) => {
        // Progress callback
        const progress = (xhr.loaded / xhr.total) * 100;
        loadingIndicator.textContent = `Loading 3D Model: ${Math.round(progress)}%`;
    }, (error) => {
        // Error callback
        console.error('An error occurred while loading the GLB model:', error);
        loadingIndicator.textContent = 'Error loading model.';
    });

    // Removed the ground plane to make the shoe appear floating
    // const planeGeometry = new THREE.PlaneGeometry(10, 10);
    // const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White material
    // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // plane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    // plane.position.y = -1.5; // Position below the sneaker
    // plane.receiveShadow = true; // Make the plane receive shadows
    // scene.add(plane);

    // Handle window resizing
    window.addEventListener('resize', onWindowResize);
}

// The onMouseMove, onMouseLeave, and onMouseEnter functions are no longer needed
// since OrbitControls handles the interaction. Removed them to avoid confusion.
// function onMouseMove(event) { ... }
// function onMouseLeave() { ... }
// function onMouseEnter() { ... }

function onWindowResize() {
    const heroSection = document.querySelector('.hero');
    // Update camera aspect ratio
    camera.aspect = heroSection.clientWidth / heroSection.clientHeight;
    camera.updateProjectionMatrix();
    // Update renderer size
    renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (sneakerModel) {
        // Apply floating animation
        // Use Math.sin for a smooth up and down motion based on time
        sneakerModel.position.y = 0.5 + Math.sin(Date.now() * floatSpeed) * floatAmplitude;

        // OrbitControls update must be called in the animation loop
        controls.update(); 
        sneakerModel.position.y = -1;
    }

    renderer.render(scene, camera);
}

// Scroll animation for sections (existing logic)
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.75) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });
});

// Initialize sections with fade-in effect (existing logic)
sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(50px)';
    section.style.transition = 'all 0.5s ease';
});

// Trigger initial animation and Three.js setup when the window loads
window.onload = function () {
    // Initialize Three.js scene and load model
    initThreeJS();
    // Trigger initial scroll animation
    window.dispatchEvent(new Event('scroll'));
}
