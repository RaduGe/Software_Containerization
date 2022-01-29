import { Component, OnInit } from '@angular/core';
import { Person } from '../person';
import { RestDataService } from '../rest-data.service';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.css']
})

export class PersonComponent implements OnInit {
  persons: Person[] = [];

  selectedPerson?: Person;

  constructor(private restService: RestDataService) { }

  ngOnInit(): void {
    this.getPersons();
  }

  getPersons(): void {
    this.restService.getPersons()
    .subscribe(persons => {
      this.persons = persons;
    
    })
  }

  onSelect(person: Person): void {
    this.selectedPerson = person;
  }

  delete(person: Person): void {
    this.persons = this.persons.filter(h => h !== person);
    this.restService.deletePerson(person.person_id!).subscribe();
  }

  add(name: string, age: string|number): void {
 
    name = name.trim();
    var parsed_age: number = +age;
    var dummy_id = 0;
    age = parsed_age;
    
    if (!name) { return; }
    this.restService.addPerson({dummy_id, name, age } as Person)
      .subscribe(person => {
        this.persons.push(person);
      });
  }

}