'use strict';
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vector) {
	  try {
      if (!(vector instanceof	Vector)){
		    throw new Error('Можно прибавлять к вектору только вектор типа Vector');
	    } else {
        return new Vector(this.x + vector.x, this.y + vector.y);  
	    }	  
	  } catch(e){
		  console.log(e.message);
    }
  }
  times(number){
    return new Vector(this.x * number, this.y * number);
  }
}

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)){
    try {  
	    if (!(pos instanceof Vector) ||!(size instanceof Vector) ||!(speed instanceof Vector)){
		    throw new Error('Может быть передан только объект класса Vector')
	    }
	    this.pos = pos;
      this.size = size;
      this.speed = speed;
      
      Object.defineProperty(this, 'type', {value : 'actor', writable :false})	
      this.act = function(){};
	
	  } catch(e) {
		  console.log(e.message)
	  }
  } 	
  get left(){
    return this.pos.x
  }
  get right(){
   return this.pos.x + this.size.x;
  }
  get bottom(){
    return this.pos.y + this.size.y;
  }
  get top(){
    return this.pos.y;
  }
  isIntersect(actor) {
    try {
      if (!(actor instanceof  Actor)){
        throw new Error('Неправильный аргумент')
      }
      if (actor === this) {
        return false;
      } else {
	      if (this.left > actor.right || this.right < actor.left || this.top > actor.bottom || this.bottom < actor.top) {
			    return false
		    } else return true 
      }   
    
    } catch(e) {
      console.log(e.message)
    }
 }
}
