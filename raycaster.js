import * as THREE from 'three';

export function getFirstObjectWithName(event, window, camera, scene, name){
    camera.updateProjectionMatrix();
    const raycaster = new THREE.Raycaster();
    const getFirstValue = true;

    const mousePointer = getMouseVector2(event, window);
	const intersections = checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue);
	const objectList = getObjectsByName(intersections, name);

    if(objectList[0] !== undefined){
        if(objectList[0].name.includes(name)){
            console.log(objectList[0]);
            return objectList[0]
        }
    }
    return null;
}

export function getMouseVector2(event, window){
    let mousePointer = new THREE.Vector2()

    mousePointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	mousePointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    return mousePointer;
}

export function checkRayIntersections(mousePointer, camera, raycaster, scene) {
    raycaster.setFromCamera(mousePointer, camera);

    let intersections = raycaster.intersectObjects(scene.children, true);

    return intersections;
}

export function getObjectsByName(objectList, name){
    const objects = [];
    
    objectList.forEach((object) => {
        //const objectName = object.object.name || "Unnamed Object";
        /*objectName.includes(name) ? */objects.push(object.object) /*: null*/;
    });

    return objects;
}