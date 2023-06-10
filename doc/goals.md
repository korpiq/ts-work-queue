# Goals of ts-work-queues

## Easy to use

Burden of learning and catering for provided functionality should not exceed the help nor joy it brings.

### Correct use is obvious

Exported member and parameter names should explain themselves.

Everything should be straightforward after single read of related documentation, test, or code.

### Single statement for each use case

### Concepts are based on use above internal implementation

Concepts borne out of internal structure should not affect interface.

### Only injected dependencies

One good criteria is that testing shall not require replacing imported functionality, only providing custom parameters.

This may necessitate accepting even Promise as a configuration parameter.

### Transparent

Driven by data more than functions or objects, so that state can be inspected and manipulated.

## Use cases

### Locking: prevent a resource from concurrent access

Use a queue with one or no execution to prevent simultaneous access to a resource.

#### Prevent deadlocks 

Enable accessing multiple resources only in always same order, or

Global prioritization such that any number of jobs that would require more than one shared resource will be run sufficiently separately so that none of them may hold a resource that might be needed by another in a circular manner.

### Throttle: limit simultaneous processes

Like Promise.all but only run at most a preset number of jobs concurrently.

### Different limits for different uses of same resource

Perform multiple concurrent reads, but only one write at a time.

### Prioritizing

E.g. fast jobs before slow jobs, or synchronous client requests served before batch jobs.

Best done with priority list dimension.

### Job chaining

Like Promise.then, ensure that specific jobs can be executed consecutively in order.

Easy to do with a list of jobs in place of one job.

### Unlimited target resources

Namespaces can be configured to provide queues for predefined and/or dynamically identified targets.

E.g.

- at most 100 simultaneous database read connections
- of which at most 10 simultaneous database write connections
- of which at most 1 database write connection for any specific set of tables.
    - any set of tables will block write access to any other set of tables containing any of the same tables.

### Hooks

Allow configuring handlers and wrappers for all relevant state changes.

E.g.

- wrapper for each job to ensure they are executed at specific intervals
- step a queue one job at a time for that kind of control (e.g. troubleshooting, ensuring resource state)
- managing resources associated with queues (e.g. creating, keeping alive, and closing separate db connection for each concurrent queue created for db access)
- catch exceptions of specific jobs separately from catching every exception from the whole work queuing system, as well as any queue or other subsystem.

### Auditability

Hooks for recording all relevant information about state changes as they happen.

### Persistence

Hooks for persisting state so it can be restored such that unfinished jobs may be inspected and/or retried.

