'use strict';
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    } else {
      return new Vector(this.x + vector.x, this.y + vector.y);
    }
  }
  times(number) {
    return new Vector(this.x * number, this.y * number);
  }
}

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(pos instanceof Vector) ||!(size instanceof Vector) ||!(speed instanceof Vector)) {
      throw new Error('Может быть передан только объект класса Vector')
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }
  act() {
    return; 
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
    } else {
      if (this.left >= actor.right || this.right <= actor.left || this.top >= actor.bottom || this.bottom <= actor.top) {
        return false;
      } else return true; 
    }   
  }
}

function getMaxLength(grid) {
  if (grid.length) {
    if (Array.isArray(grid[0])) {
      return grid.reduce(function(memo, current) { 
        if (current.length > memo) {
          memo = current.length;
	      }
	      return memo;
      }, grid[0].length)
    } else return grid.length
  } else return 0;  
}

function gridHeigth(grid) {
  if(grid.length) {
	  return grid.length;
	}  else return 0;
}

function getPlayer(actors) {
  return actors.find(function(item) { return item.type === 'player'})
}

class Level {
	constructor(grid = [], actors = []){
		this.grid = grid;
		this.actors  = actors;
		this.player = getPlayer(actors);
		this.height = gridHeigth(grid);
		this.width  = getMaxLength(grid);
		this.status = null;
		this.finishDelay = 1;
       
	}
  isFinished() {
    return (this.status !== null) && (this.finishDelay < 0)
  }
  actorAt(actor) {
    if (!(actor instanceof  Actor)) {
      throw new Error('Неправильный аргумент')
    } else {
      return this.actors.find((item)=>{return actor.isIntersect(item)})
    }
  }
  obstacleAt(pos, size) {
    let posY = Math.ceil(pos.y);
    let posX = Math.ceil(pos.x);
    let sizeX = Math.ceil(size.x);
    let obstacle;
    if (!(pos instanceof Vector) ||!(size instanceof Vector)) {
      throw new Error('Может быть передан только объект класса Vector')
    } else {
      if (posY < 0) {
        return 'wall';
      } else if (posY == this.grid.length) {
        return 'lava';
      }
      obstacle = this.grid[posY].slice(posX, posX + sizeX)
      if (obstacle === undefined) {
        return obstacle;
      } else if (obstacle.length === 0) {
        return 'wall'; 
      } else if (obstacle[0] ==='wall') {
	return 'wall';
      } else if (obstacle[0] ==='lava') {
	return 'lava';
      }
    }
  }
  removeActor(actor) {
	  if (this.actors.indexOf(actor) !== -1) {
      this.actors.splice(this.actors.indexOf(actor), 1);
		  if (this.actors.indexOf(actor)==-1) { 
        this.status = 'won';
		  }  
		} 	
  }
  
 noMoreActors(actorType) {
   let result = this.actors.find(value =>  value.type == actorType); 
	 return result === undefined
	}

	playerTouched(objectName, actor) {  
	  switch(objectName) {
		  case('lava'): this.status = 'lost';
		  break;
		  case('fireball'): this.status = 'lost';
		  break;
		  case('coin'):this.removeActor(actor);
		  break;
		}
	}
}



























