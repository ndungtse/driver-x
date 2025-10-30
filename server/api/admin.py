from django.contrib import admin

from .models import Driver, Trip, DailyLog, Activity, Route, RequiredStop


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'role', 'license_number', 'home_terminal')
    search_fields = ('user__username', 'user__email', 'license_number')


class ActivityInline(admin.TabularInline):
    model = Activity
    extra = 0


@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'trip', 'date', 'driving_hours', 'off_duty_hours')
    list_filter = ('date',)
    inlines = [ActivityInline]


class RequiredStopInline(admin.TabularInline):
    model = RequiredStop
    extra = 0


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('id', 'trip', 'total_distance', 'estimated_time')
    inlines = [RequiredStopInline]


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('id', 'driver', 'status', 'start_datetime', 'end_datetime', 'total_distance')
    list_filter = ('status',)


