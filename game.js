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
    return (this.left < actor.right) && (this.right > actor.left) && (this.top < actor.bottom) && (this.bottom > actor.top);  
  }
}

function getMaxLength(grid = 0) {
  if (grid.length === 0) {
    return 0;
  } 	
  const length = grid.map(item => {
    return item.length;
  });
  return Math.max(...length);
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
    if ((this.status !== null) && (this.finishDelay < 0)) {
		  return true;
	  } else if((this.status !== null) && (this.finishDelay > 0)) {
		  return false;
	  }
	  return false;
  }
  actorAt(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error ('Неправильный аргумент');
    } else {
      return this.actors.find((item)=>{return actor.isIntersect(item)});
    }
  }
	
  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('Может быть передан только объект класса Vector');
    }
    let left = Math.floor(pos.x);
    let right = Math.ceil(pos.x + size.x);
    let up =  Math.round(pos.y);
    let down = Math.ceil(pos.y + size.y);
  
    if (left < 0 || up < 0 || right > this.width) return 'wall';
    if (down > this.height) return 'lava';
    for(let i = up; i < down; i++) {
      for(let j = left; j < right; j++) {
        if(this.grid[i][j] !== undefined) {
          return this.grid[i][j];
        }
      }
    }	
  }
	
  removeActor(actor) {
    this.actors.splice(this.actors.indexOf(actor), 1); 
  }
  
  noMoreActors(actorType) {
    let result = this.actors.find(value => value.type == actorType); 
    return result === undefined;
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
  constructor(dictionary) {
    this.dictionary = dictionary;
  }
  actorFromSymbol(symbol) {
    if (!symbol) {
      return undefined;
    } else { 
      return this.dictionary[symbol];
    }  
  }
  obstacleFromSymbol(symbol) {
    switch (symbol) {
      case('x'): return 'wall';
      case('!'): return 'lava';
    }
  }
  createGrid(strings) {
    if (strings.length === 0) {
      return [];
    } else if (strings) {
        let result =  strings.map(function(item) {
          let arr = item.split('');
          return arr.map(function(value) {
            switch(value) {
              case('x'):return 'wall';
              case('!'):return 'lava';
              default: return undefined;
            }
          });
        });
      return result;		  
    }  	  
  }

  createActors(arrayOfActors) {
    let result = [];
    if (arrayOfActors.length === 0 || this.dictionary === undefined) {
      return [];
    } else {
      arrayOfActors.forEach((el,yCoord)=> {
        el = el.split('');
        el.forEach((index, xCoord)=> {
          let actorConstructor = this.actorFromSymbol(index);  
            if ((actorConstructor !== undefined) &&
                (this.dictionary[index] instanceof Function) &&
                (new actorConstructor instanceof Actor)
               ) {
                    let x = xCoord;
                    let y = yCoord;
                    result.push(new actorConstructor(new Vector(x, y))); 
                } else {}
        });
      });
    }	
    return result;	 
  }		

  parse(arrayOfStrings) {
    let grid, actors;  
    grid  = this.createGrid(arrayOfStrings);
    actors = this.createActors(arrayOfStrings);
    return new Level(grid, actors);
  }

}

class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed  = new Vector(0, 0) ) {
    super();	
    this.pos = pos;
    this.speed = speed;
    this.size = new Vector(1,1);
  }
  get type() {
    return 'fireball';
  }
  getNextPosition(time = 1) {
    let newX = this.pos.x + this.speed.x * time;
    let newY = this.pos.y + this.speed.y * time;
    return new Vector(newX, newY);
  }
  handleObstacle() {
    this.speed.x = - this.speed.x;
    this.speed.y = - this.speed.y;
  }
  act(time, level) {
    let position = this.getNextPosition(time);
    let result = level.obstacleAt(position, this.size);
    if (result !== undefined) {
      this.handleObstacle();
    } else {
      this.pos = this.getNextPosition(time);	
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(0, 0), speed  = new Vector(2, 0) ) {
    super();	
    this.pos = pos;
    this.speed = speed;
    this.size = new Vector(1,1);
  }
}

class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0, 0), speed  = new Vector(0, 2) ) {
    super();	
    this.pos = pos;
    this.speed = speed;
    this.size = new Vector(1,1);
  }
}

class FireRain extends Fireball {
  constructor(pos = new Vector(0, 0), speed  = new Vector(0, 3) ) {
    super();
    this.start = pos;
    this.pos = pos;
    this.speed = speed;
    this.size = new Vector(1,1);
  }
  handleObstacle() {
    return this.pos = this.start;
  }
}	

function random(min, max) {
  const diff = max - min + 1; 
  return Math.floor(Math.random() * diff) + min;
}
class Coin extends Actor{
  constructor(pos = new Vector(0, 0)) {
    super();
    this.base = pos;
    this.pos = pos;
    this.pos.x += 0.2;
    this.pos.y += 0.1;
    this.size = new Vector(0.6, 0.6);
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
    let y = Math.sin(this.spring) * this.springDist;
    return new Vector(0, y);
  }
  getNextPosition(time = 1) {
    this.updateSpring(time);
    let springVector = this.getSpringVector(time);
    springVector.y +=  this.base.y;
    return new Vector(this.base.x, springVector.y);
  }
  act(time) {
    this.pos = this.getNextPosition(time);
  }
}
class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super();
    this.pos = pos;
    this.pos.y -= 0.5;
    this.size = new Vector(0.8, 1.5);
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














