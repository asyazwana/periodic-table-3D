async function loadSheet(){
  let url = "https://script.google.com/macros/s/AKfycbxFwdTQJJ9lEpeHqlQIYUigGiO4zSRumgJJ90BT1xOxjaNJCvRIkaGougyUCGqwh8Hjyg/exec"
  let res = await fetch(url);
  let data = await res.json();
  return data;
}

function onSignIn(response){
  console.log("User signed in:", response);
  document.querySelector(".g_id_signin").style.display = "none";
  init();
}

let camera, scene, renderer;
let objects = [];
let targets = { table: [], sphere: [], helix: [], grid: [] };

async function init(){
  const data = await loadSheet();

  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);

  camera.position.z = 3000;

  scene = new THREE.Scene();

  data.forEach((row, i) => {
    let object = createTile(row);
    scene.add(object);
    objects.push(object);
  });

  buildTable();
  buildSphere();
  buildHelix();
  buildGrid();

  renderer = new THREE.CSS3DRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("container").appendChild(renderer.domElement);

  animate();
}

function createTile(item){
  let element = document.createElement('div');
  element.className = 'element';

  element.innerHTML = `
  <div class="id">${item[0]}</div>
  <div class="name">${item[1]}</div>
  <img class="photo" src="${item[2]}">
  <div class="worth">${item[3]}</div>
  <div class="company">${item[4]}</div>`;

  let worth = parseInt(item[3]);
  if (worth < 100000) element.style.background = "red";
  else if (worth > 200000) element.style.background = "orange";
  else element.style.background = "green";

  let object = new THREE.CSS3DObject(element);
  object.position.x = Math.random() * 4000 - 2000;
  object.position.y = Math.random() * 4000 - 2000;

  return object;
}

function buildTable(){
  for (let i = 0; i < objects.length; i++){
    let row = Math.floor(i / 20);
    let col = i % 20;

    let object = new THREE.Object3D();
    object.position.x = col * 140 - 1400;
    object.position.y = -row * 180 + 900;

    targets.table.push(object);
  }
}

function buildHelix(){
  let separation = 20;
  let radius = 800;

  for (let i = 0; i < objects.length; i++){
    let angle = i * 0.3;
    let helixOffset = (i % 2 === 0 ? 100 : -100);

    let object = new THREE.Object3D();
    object.position.x = Math.sin(angle) * radius;
    object.position.y = -(i * separation) + 400;
    object.position.z = Math.cos(angle) * radius + helixOffset;

    targets.helix.push(object);
  }
}

function buildSphere(){
  let vector = new THREE.Vector3();
  let length = objects.length;

  for (let i = 0; i < length; i++){
    let phi = Math.acos(-1 + (2 * i) / length);
    let theta = Math.sqrt(length * Math.PI) * phi;

    let object = new THREE.Object3D();
    object.position.x = 800 * Math.cos(theta) * Math.sin(phi);
    object.position.y = 800 * Math.sin(theta) * Math.sin(phi);
    object.position.z = 800 * Math.cos(phi);

    targets.sphere.push(object);
  }
}

function buildGrid(){
  for(let i = 0; i < objects.length; i++){
    let x = i % 5;
    let y = Math.floor(i / 5) % 4;
    let z = Math.floor(i / 20);

    let object = new THREE.Object3D();
    object.position.set(
      x * 200 - 400,
      y * 200 - 300,
      z * 200 - 1000
    );

    targets.grid.push(object);
  }
}

function transform(targetArray, duration){
  TWEEN.removeAll();

  for (let i = 0; i < objects.length; i++){
    let object = objects[i];
    let target = targetArray[i];

    new TWEEN.Tween(object.position)
    .to({
      x: target.position.x,
      y: target.position.y,
      z: target.position.z,
    }, Math.random() * duration + duration)
    .easing(TWEEN.Easing.Exponential.InOut)
    .start();
  }
}

function animate(){
  requestAnimationFrame(animate);
  TWEEN.update();
  renderer.render(scene, camera);
}


