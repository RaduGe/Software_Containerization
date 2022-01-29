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
    this.restService.deletePerson(person.person_id).subscribe();
  }

}