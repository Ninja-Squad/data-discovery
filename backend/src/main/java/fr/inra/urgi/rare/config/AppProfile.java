package fr.inra.urgi.rare.config;

/**
 * Class defining constants for all the app profiles.
 * One and only one of these profiles must be active. It allows selecting which implementation of various abstract
 * components to use, as well as defining some properties.
 * @author JB Nizet
 */
public final class AppProfile {

    public static final String RARE = "rare-app";
    public static final String WHEATIS = "wheatis-app";

    private AppProfile() {
    }
}
