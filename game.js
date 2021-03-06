'use strict';
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
	
  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    } 
    return new Vector(this.x + vector.x, this.y + vector.y);
  }
	
  times(number) {
    return new Vector(this.x * number, this.y * number);
  }
}

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(pos instanceof Vector) ||!(size instanceof Vector) ||!(speed instanceof Vector)) {
      throw new Error('Может быть передан только объект класса Vector');
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }
	
  act() {
  }
	
  get type() {
    return 'actor';
  }
	
  get left() {
    return this.pos.x;
  }
	
  get right() {
    return this.pos.x + this.size.x;
  }
	
  get bottom() {
    return this.pos.y + this.size.y;
  }
	
  get top() {
    return this.pos.y;
  }
	
  isIntersect(actor) {
    if (!(actor instanceof  Actor)){
      throw new Error('Неправильный аргумент');
    }
    if (actor === this) {
      return false;
    } 
    return this.left < actor.right && this.right > actor.left && this.top < actor.bottom && this.bottom > actor.top;  
  }
}

function getMaxLength(grid = []) {
  return Math.max(0, ...grid.map(item => item.length));
}	

class Level {
  constructor(grid = [], actors = []){
    this.grid = [...grid];
    this.actors  = [...actors];
    this.player = actors.find(value => value.type === 'player');
    this.height = grid.length;
    this.width  = getMaxLength(grid);
    this.status = null;
    this.finishDelay = 1;     
  }
  isFinished() {
    return (this.status !== null) && (this.finishDelay < 0);
  }
  actorAt(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error ('Неправильный аргумент');
    }
    return this.actors.find(item => actor.isIntersect(item));
  }	
  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('Может быть передан только объект класса Vector');
    }
    const left = Math.floor(pos.x);
    const right = Math.ceil(pos.x + size.x);
    const up =  Math.floor(pos.y);
    const down = Math.ceil(pos.y + size.y);
  
    if (left < 0 || up < 0 || right > this.width) { 
      return 'wall';
    }	    
    if (down > this.height) {
      return 'lava';
    }	    
    for(let i = up; i < down; i++) {
      for(let j = left; j < right; j++) {
	const point = this.grid[i][j];     
        if (point !== undefined) {
          return point;
        }
      }
    }	
  }
	
  removeActor(actor) {
    const pos = this.actors.indexOf(actor);
    if (pos !== -1) {
      this.actors.splice(pos, 1);
    }	    	    
  }
  
  noMoreActors(actorType) {
    return !this.actors.some(value => value.type == actorType);
  }
  
  playerTouched(objectName, actor) {  
    switch(objectName) {
      case('lava'): this.status = 'lost';
      break;
      case('fireball'): this.status = 'lost';
      break;
      case('coin'): {
        this.removeActor(actor);
        if (this.noMoreActors('coin')) {
	  this.status = 'won';
        }
      }  
      break;
    }
  }
}

class LevelParser {
  constructor(dictionary = {}) {
    this.dictionary = Object.assign({}, dictionary);
  }
	
  actorFromSymbol(symbol) {
    return this.dictionary[symbol];  
  }
	
  obstacleFromSymbol(symbol) {
    switch (symbol) {
      case('x'): return 'wall';
      case('!'): return 'lava';
    }
  }
	
  createGrid(strings = []) {
    return strings.map(item => item.split('').map(value => this.obstacleFromSymbol(value)));	    	  
  }

  createActors(arrayOfActors) {
    const result = [];
    if (arrayOfActors.length === 0 || this.dictionary === undefined) {
      return [];
    } else {
      arrayOfActors.forEach((el,yCoord) => {
        el = el.split('');
        el.forEach((index, xCoord) => {
          const actorConstructor = this.actorFromSymbol(index); 
          if (actorConstructor instanceof Function) {
	    const theActor = new actorConstructor(new Vector(xCoord, yCoord));	 
            if (theActor instanceof Actor) {
	      result.push(theActor);
	    }
          }
        });
      });
    }	
    return result;	 
  }

  parse(arrayOfStrings) {
    const grid = this.createGrid(arrayOfStrings);
    const actors = this.createActors(arrayOfStrings);  
    return new Level(grid, actors);
  }

}

class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    const size = new Vector(1, 1);  
    super(pos, size, speed); 
  }
	
  get type() {
    return 'fireball';
  }
	
  getNextPosition(time = 1) {
    return this.pos.plus(this.speed.times(time));
  }
	
  handleObstacle() {
    this.speed = this.speed.times(-1);
  }
	
  act(time, level) {
    const position = this.getNextPosition(time);
    const result = level.obstacleAt(position, this.size);
    if (result !== undefined) {
      this.handleObstacle();
    } else {
      this.pos = this.getNextPosition(time);	
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    const speed =  new Vector(2, 0);  
    super(pos, speed); 
  }
}

class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    const speed = new Vector(0, 2);
    super(pos, speed);
  }
}

class FireRain extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    const speed =  new Vector(0, 3); 
    super(pos, speed);
    this.start = pos;
  }
	
  handleObstacle() {
    return this.pos = this.start;
  }
}	

function random(min, max) {
  const diff = max - min + 1; 
  return Math.floor(Math.random() * diff) + min;
}

class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    const size = new Vector(0.6, 0.6); 
    const position = pos.plus(new Vector(0.2, 0.1));
    super(position, size);
    this.base = position;
	  
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = random(0, 2 * Math.PI);
  }
	
  get type() {
    return 'coin';
  }
	
  updateSpring(time = 1) {
    this.spring = this.spring + this.springSpeed * time;
  }
	
  getSpringVector() {
    const y = Math.sin(this.spring) * this.springDist;
    return new Vector(0, y);
  }
	
  getNextPosition(time = 1) {
    this.updateSpring(time);
    const springVector = this.getSpringVector(time);
    springVector.y +=  this.base.y;
    return new Vector(this.base.x, springVector.y);
  }
	
  act(time) {
    this.pos = this.getNextPosition(time);
  }
	
}
class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    const size = new Vector(0.8, 1.5); 
    const position = pos.plus(new Vector(0, -0.5));
    super(position, size);
  }
	
  get type() {
    return 'player';
  }
}

const actorDict = {
  '@': Player,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'o': Coin,
  'v': FireRain
};
loadLevels()
  .then(function(resolved) {
    const parser = new LevelParser(actorDict);
    runGame(JSON.parse(resolved), parser, DOMDisplay)
      .then(() => alert('Вы выиграли приз!'));
  });














