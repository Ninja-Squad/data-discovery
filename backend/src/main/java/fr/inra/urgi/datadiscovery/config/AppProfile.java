package fr.inra.urgi.datadiscovery.config;

/**
 * Class defining constants for all the app profiles.
 * One and only one of these profiles must be active. It allows selecting which implementation of various abstract
 * components to use, as well as defining some properties.
 * @author JB Nizet
 */
public final class AppProfile {

    public static final String RARE = "rare-app";
    public static final String BRC4ENV = "brc4env-app";
    public static final String WHEATIS = "wheatis-app";
    public static final String FAIDARE = "faidare-app";

    private AppProfile() {
    }
}
