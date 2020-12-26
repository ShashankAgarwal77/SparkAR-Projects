/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 */

//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//==============================================================================

// How to load in modules
//const Scene = require('Scene');

// Use export keyword to make a symbol available in scripting debug console
//export const Diagnostics = require('Diagnostics');

// To use variables and functions across files, use export/import keyword
// export const animationDuration = 10;

// Use import keyword to import a symbol from another file
// import { animationDuration } from './script.js'

// To access scene objects
// const directionalLight = Scene.root.find('directionalLight0');

// To access class properties
// const directionalLightIntensity = directionalLight.intensity;

// To log messages to the console
// Diagnostics.log('Console message logged from the script.');

const Scene = require('Scene');
const Animation = require('Animation');
const TouchGestures = require('TouchGestures');
const Instruction = require('Instruction'); 
const Time = require('Time');
const Reactive = require('Reactive');
const Diagnostics = require('Diagnostics');

const sceneRoot = Scene.root;

Promise.all([
    sceneRoot.findFirst('toyAirplane'),
    sceneRoot.findFirst('planeTracker0'),
    sceneRoot.findFirst('placer')

])
.then(function(objects){

    const base = objects[0];
    const planeTracker = objects[1];
    const placer = objects[2];


    const baseDriverParameter = {
        durationMilliseconds: 4000,
        loopCount: 1,
        mirror: true  
    };

    const baseDriver = Animation.timeDriver(baseDriverParameter);
    baseDriver.start();
    const baseSampler = Animation.samplers.easeInOutCirc(0,1);

    const baseAnimation = Animation.animate(baseDriver, baseSampler);

    const baseTransform = base.transform;

    baseTransform.scaleX = baseAnimation;
    baseTransform.scaleY = baseAnimation;
    baseTransform.scaleZ = baseAnimation;

    // var show = Time.ms.lt(5000);
    // var rotate = Time.ms.lt(10000);
    // var pinch = Time.ms.lt(15000);
    // Instruction.bind(show, 'tap_to_place');
    // Instruction.bind(rotate, 'use_2_fingers_to_rotate');
    // Instruction.bind(pinch, 'pinch_to_change');

    var condition = Reactive.mod(Reactive.round(Reactive.div(Time.ms,5000)),2).eq(0);
    condition.monitor().subscribe(function(event){

        if(event.newValue)
        {
            Instruction.bind(true,'tap_to_place');
        }else{
            Instruction.bind(true,'use_2_fingers_to_rotate');
        }
        
    });

    Instruction.bind(true, 'use_2_fingers_to_rotate');
    Instruction.bind(true, 'tap_to_place');


    base.hidden = true;
    TouchGestures.onTap().subscribeWithSnapshot({
    },function(gesture, snapshot){
        base.hidden = false;
    });

    TouchGestures.onPan().subscribe(function(gesture){
        planeTracker.trackPoint(gesture.location, gesture.state);
    });

    const placerTransform = placer.transform;

    TouchGestures.onPinch().subscribeWithSnapshot({   
        'lastScaleX' : placerTransform.scaleX,
        'lastScaleY' : placerTransform.scaleY,
        'lastScaleZ' : placerTransform.scaleZ


    },function(gesture, snapshot){
            placerTransform.scaleX = gesture.scale.mul(snapshot.lastScaleX);
            placerTransform.scaleY = gesture.scale.mul(snapshot.lastScaleY);
            placerTransform.scaleZ  = gesture.scale.mul(snapshot.lastScaleZ);
    });

    TouchGestures.onRotate().subscribeWithSnapshot( {
        'lastRotationY' : placerTransform.rotationY,
    }, function(gesture, snapshot) {
        const correctRotation = gesture.rotation.mul(-1);
        placerTransform.rotationY = correctRotation.add(snapshot.lastRotationY);
    });

});