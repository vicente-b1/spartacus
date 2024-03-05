/**
 * 2021 SAP SE or an SAP affiliate company. All rights reserved.
 */

import { Subscription } from 'rxjs';

export class SubscriptionTracker extends Subscription {
	/**
	 * An assignment-based alternative to `add()`, assign a subscription to the set of tear down actions.
	 */
	set sub(sub: Subscription | undefined) {
		this.add(sub);
	}
}
