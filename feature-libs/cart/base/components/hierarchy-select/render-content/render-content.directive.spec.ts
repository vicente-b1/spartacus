/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { ComponentFactoryResolver, InjectionToken, Injector, TemplateRef, ViewContainerRef } from '@angular/core';

import { RenderContentDirective } from './render-content.directive';

describe('RenderContentDirective', () => {
	class MockComponent {}

	class MockTemplateRef<T> extends TemplateRef<T> {
		elementRef = null;

		createEmbeddedView(): null {
			return null;
		}
	}

	interface TestContext {
		foo: string;
		bar: string;
	}

	let factory: ComponentFactoryResolver;
	let templateRef: TemplateRef<TestContext>;
	let token: InjectionToken<TestContext>;
	let viewContainerRef: ViewContainerRef;

	beforeEach(() => {
		factory = jasmine.createSpyObj('ComponentFactoryResolver', {
			resolveComponentFactory: 'foo',
		});

		templateRef = new MockTemplateRef();

		token = new InjectionToken('Test token.');

		viewContainerRef = jasmine.createSpyObj('ViewContainerRef', ['createComponent', 'createEmbeddedView']);
	});

	it('should create an instance', () => {
		const directive = new RenderContentDirective(factory, templateRef, viewContainerRef);
		expect(directive).toBeTruthy();
	});

	it('should render using a component declaration', () => {
		const directive = new RenderContentDirective(factory, templateRef, viewContainerRef);
		directive.renderContentTemplate = MockComponent;
		directive.renderContentToken = token;
		directive.renderContentContext = {
			foo: 'foo',
			bar: 'bar',
		};

		directive.ngOnInit();

		expect(viewContainerRef.createComponent).toHaveBeenCalledTimes(1);

		const args = (<jasmine.Spy>viewContainerRef.createComponent).calls.mostRecent().args;

		expect(args[0]).toBe('foo');
		expect(args[1]).toBe(0);

		const injector: Injector = args[2];

		expect(injector.get(token)).toEqual({
			foo: 'foo',
			bar: 'bar',
		});
	});

	it('should render using a template ref', () => {
		const directive = new RenderContentDirective(factory, templateRef, viewContainerRef);

		const renderedTemplate = new MockTemplateRef();

		directive.renderContentTemplate = renderedTemplate;
		directive.renderContentContext = {
			foo: 'foo',
			bar: 'bar',
		};

		directive.ngOnInit();

		expect(viewContainerRef.createEmbeddedView).toHaveBeenCalledTimes(1);
		expect(viewContainerRef.createEmbeddedView).toHaveBeenCalledWith(renderedTemplate, {
			$implicit: {
				foo: 'foo',
				bar: 'bar',
			},
		});
	});

	it('should render using a default template', () => {
		const directive = new RenderContentDirective(factory, templateRef, viewContainerRef);
		directive.renderContentContext = {
			foo: 'baz',
			bar: 'bar',
		};

		directive.ngOnInit();

		expect(viewContainerRef.createEmbeddedView).toHaveBeenCalledTimes(1);
		expect(viewContainerRef.createEmbeddedView).toHaveBeenCalledWith(templateRef, {
			foo: 'baz',
			bar: 'bar',
		});
	});
});
