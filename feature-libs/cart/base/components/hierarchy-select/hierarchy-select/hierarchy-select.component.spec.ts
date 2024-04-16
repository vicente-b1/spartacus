/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import {
  Component,
  Input,
  NO_ERRORS_SCHEMA,
  SimpleChange,
} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UntypedFormBuilder } from '@angular/forms';
import { HierarchyNode } from '../hierarchy-node.model';
import { HierarchySelectComponent } from './hierarchy-select.component';

@Component({
  selector: 'app-hierarchy-node',
  template: '',
})
export class MockAppHierarchyNodeComponent {
  @Input() tree: HierarchyNode;

  @Input() paddingPrefix = 0;

}

describe('HierarchySelectComponent', () => {
  let component: HierarchySelectComponent;
  let fixture: ComponentFixture<HierarchySelectComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.overrideComponent(HierarchySelectComponent, {
        set: {
          providers: [],
        },
      })
        .configureTestingModule({
          declarations: [
            HierarchySelectComponent,
            MockAppHierarchyNodeComponent,
          ],
          providers: [UntypedFormBuilder],
          schemas: [NO_ERRORS_SCHEMA],
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent<HierarchySelectComponent>(
      HierarchySelectComponent
    );
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update bottom border on tree change according to children', () => {
    const mockTreeWithoutChildren = new HierarchyNode('root w/o children');
    const mockTreeWithChildren = new HierarchyNode('root', {
      children: [new HierarchyNode('L1 Node1')],
    });

    component.tree = mockTreeWithoutChildren;
    component.ngOnChanges({
      tree: new SimpleChange(null, mockTreeWithoutChildren, false),
    });
    fixture.detectChanges();
    expect(component.showBorderBottom).toBe(true);

    component.tree = mockTreeWithChildren;
    component.ngOnChanges({
      tree: new SimpleChange(
        mockTreeWithoutChildren,
        mockTreeWithChildren,
        false
      ),
    });
    fixture.detectChanges();
    expect(component.showBorderBottom).toBe(false);
  });
});
