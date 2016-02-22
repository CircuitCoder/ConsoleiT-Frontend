interface Person {
  name: string;
}

function greeter(person: Person) {
  return "Hello, " + person.name;
}

var user = {name: "Liu"};
console.log(greeter(user));
