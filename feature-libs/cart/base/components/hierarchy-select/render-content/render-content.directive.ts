/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { ComponentFactoryResolver, Directive, InjectionToken, Injector, Input, OnInit, TemplateRef, Type, ViewContainerRef } from '@angular/core';

/**
 * Use as a structural directive.
 * example use:
 * <ng-template *renderContent="componentOrTemplate; context: { info: info }; token: TOKEN">
 *   This is your default if no component or template is set.
 * </ng-template>
 *
 * Most useful for components that can configure their own content.
 */
@Directive({
	// eslint-disable-next-line @angular-eslint/directive-selector
	selector: '[renderContent]',
})
export class RenderContentDirective<Component = any, TemplateContext = void> implements OnInit {
	@Input('renderContent')
	renderContentTemplate?: Type<Component> | TemplateRef<{ $implicit: TemplateContext }>;

	@Input()
	renderContentContext?: TemplateContext;

	@Input()
	renderContentToken?: InjectionToken<TemplateContext>;

	constructor(private componentFactoryResolver: ComponentFactoryResolver, private templateRef: TemplateRef<TemplateContext>, private viewContainer: ViewContainerRef) {}

	ngOnInit(): void {
		if (!this.renderContentTemplate) {
			this.viewContainer.createEmbeddedView(this.templateRef, this.renderContentContext);
		} else if (!(this.renderContentTemplate instanceof TemplateRef)) {
			const factory = this.componentFactoryResolver.resolveComponentFactory(this.renderContentTemplate);

			let injector!: Injector;
			if (this.renderContentToken) {
				injector = Injector.create({
					providers: [
						{
							provide: this.renderContentToken,
							useValue: this.renderContentContext,
						},
					],
				});
			}

			this.viewContainer.createComponent(factory, 0, injector);
		} else {
			this.viewContainer.createEmbeddedView(this.renderContentTemplate, {
				$implicit: this.renderContentContext,
			});
		}
	}
}
